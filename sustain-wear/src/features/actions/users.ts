'use server';

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role, User as DbUser, Organisation } from "@prisma/client";
import { User as ClerkUser } from "@clerk/nextjs/server";

export type EnrichedUser = {
  id: string; // Clerk ID
  name: string;
  email: string;
  role: Role;
  charity: {
    id: string;
    name: string;
  } | null;
  status: "active" | "suspended";
  joinedAt: Date;
};

/**
 * Ensures the signed-in user exists in the Prisma DB.
 * Syncs Clerk user info and role automatically.
 */
export const initialiseNewUser = async () => {
  try {
    const user = await currentUser();
    const clerkUserId = user?.id;

    if (!clerkUserId) {
      throw new Error("No authenticated user found via Clerk.");
    }

    console.log("Clerk User ID:", clerkUserId);

    // Fetch full Clerk user (includes private metadata)
    const client = await clerkClient();
    const clerkUser = await client.users.getUser(clerkUserId);

    const platformRole =
      (clerkUser.privateMetadata?.role as Role) || Role.DONOR; // default fallback
    const email =
      clerkUser.emailAddresses?.[0]?.emailAddress || "no-email@unknown.com";
    const name = `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim();
    const defaultClerkOrganisationId =
      clerkUser.privateMetadata?.defaultClerkOrganisationId?.toString() || null;

    // Check if the user already exists in Prisma
    let dbUser = await prisma.user.findFirst({
      where: { clerkUserId },
    });

    if (!dbUser) {
      // Create new user in DB
      dbUser = await prisma.user.create({
        data: {
          clerkUserId,
          platformRole,
          email,
          name,
          defaultClerkOrganisationId,
        },
      });
      console.log("New user created in DB:", dbUser);
    } else {
      // Sync data in case Clerk info changed
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          email,
          name,
          platformRole,
          defaultClerkOrganisationId,
        },
      });
      console.log("User synced with Clerk:", dbUser);
    }

    return dbUser;
  } catch (error) {
    console.error("Error in initialiseNewUser:", error);
    throw error;
  }
};

/**
 * Fetches the current user from the Prisma DB (synced with Clerk).
 */
export const fetchUser = async () => {
  try {
    const user = await currentUser();
    const clerkUserId = user?.id;

    if (!clerkUserId) {
      throw new Error("No authenticated user found via Clerk.");
    }

    let dbUser = await prisma.user.findFirst({
      where: { clerkUserId },
    });

    if (!dbUser) {
      console.warn("User not found in DB — attempting to initialise...");
      dbUser = await initialiseNewUser();
    }

    return dbUser;
  } catch (error) {
    console.error("Error in fetchUser:", error);
    throw error;
  }
};

export async function getAllUsers(): Promise<{
  success: boolean;
  users?: EnrichedUser[];
  error?: string;
}> {
  try {
    // 1. Fetch all relevant data in parallel
    const clerk = await clerkClient();
    const [clerkUsersRes, dbUsers, organisations] = await Promise.all([
      clerk.users.getUserList({ limit: 500 }),
      prisma.user.findMany(),
      prisma.organisation.findMany({ where: { approved: true } }),
    ]);

    const clerkUsers = clerkUsersRes.data;

    // 2. Create maps for efficient lookups
    const dbUserMap = new Map<string, DbUser>(
      dbUsers.map((user) => [user.clerkUserId, user])
    );
    const organisationMap = new Map<string, Organisation>(
      organisations.map((org) => [org.clerkOrganisationId, org])
    );

    // 3. Combine the data
    const enrichedUsers: EnrichedUser[] = clerkUsers.map((clerkUser: ClerkUser) => {
      const dbUser = dbUserMap.get(clerkUser.id);
      const primaryEmail =
        clerkUser.emailAddresses.find(
          (e) => e.id === clerkUser.primaryEmailAddressId
        )?.emailAddress || "No email";

      const orgId =
        (clerkUser.privateMetadata?.defaultOrganisationId as string) || null;
      const organisation = orgId ? organisationMap.get(orgId) : null;

      return {
        id: clerkUser.id,
        name: `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim(),
        email: primaryEmail,
        role: dbUser?.platformRole || Role.DONOR, // Default to DONOR if not in DB
        charity: organisation
          ? { id: organisation.id, name: organisation.name }
          : null,
        status: clerkUser.banned ? "suspended" : "active",
        joinedAt: new Date(clerkUser.createdAt),
      };
    });

    return { success: true, users: enrichedUsers };
  } catch (error) {
    console.error("Error fetching all users:", error);
    return { success: false, error: "Failed to fetch users." };
  }
}

/**
 * Deletes a user from both Clerk and the local database.
 */
export async function deleteUser(clerkUserId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const clerk = await clerkClient();

    // 1. Delete user from Clerk
    try {
      await clerk.users.deleteUser(clerkUserId);
    } catch (error: any) {
      // If user not found in Clerk, continue to delete from DB
      if (error.status !== 404) {
        throw error;
      }
      console.log(`User ${clerkUserId} not found in Clerk. Proceeding with local deletion.`);
    }

    // 2. Delete user from local database
    await prisma.user.deleteMany({
      where: { clerkUserId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user.",
    };
  }
}

/**
 * Suspends (bans) a user in Clerk.
 */
export async function suspendUser(clerkUserId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const clerk = await clerkClient();
    await clerk.users.banUser(clerkUserId);
    return { success: true };
  } catch (error) {
    console.error("Error suspending user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to suspend user.",
    };
  }
}

/**
 * Unsuspends (unbans) a user in Clerk.
 */
export async function unsuspendUser(clerkUserId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const clerk = await clerkClient();
    await clerk.users.unbanUser(clerkUserId);
    return { success: true };
  } catch (error) {
    console.error("Error unsuspending user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unsuspend user.",
    };
  }
}
