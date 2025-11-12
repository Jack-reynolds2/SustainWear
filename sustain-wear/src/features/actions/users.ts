'use server';

import { currentUser, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "../../../prisma/client";
import { Role } from '@prisma/client';

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

export const users = {
  initialiseNewUser,
  fetchUser,
};
