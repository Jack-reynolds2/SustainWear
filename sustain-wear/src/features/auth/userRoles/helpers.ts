"use server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../prisma/client";
import { ROLES } from "../../constants/roles";
import { Role } from "@prisma/client";


/**
 * Ensures the signed-in Clerk user exists in Prisma and returns the prisma user record.
 * Syncs role from Clerk private metadata if available, otherwise defaults to DONOR.
 */
export const initialiseNewUser = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not authenticated");

  const clerkId = clerkUser.id;
  const email =
    clerkUser.emailAddresses?.[0]?.emailAddress ??
    clerkUser.primaryEmailAddress?.emailAddress ??
    null;
  const name = clerkUser.fullName ?? clerkUser.firstName ?? null;
  
  // Get role from Clerk private metadata, default to DONOR
  const clerkRole = (clerkUser.privateMetadata?.role as string) || ROLES.DONOR;
  // Validate it's a valid Role enum value
  const platformRole = Object.values(Role).includes(clerkRole as Role) 
    ? (clerkRole as Role) 
    : Role.DONOR;
  
  // Get defaultClerkOrganisationId from metadata if present (check both key names for compatibility)
  const defaultClerkOrganisationId = 
    (clerkUser.privateMetadata?.defaultOrganisationId as string) || 
    (clerkUser.privateMetadata?.defaultClerkOrganisationID as string) || 
    null;

  const user = await prisma.user.upsert({
    where: { clerkUserId: clerkId },
    update: { email, name, platformRole, defaultClerkOrganisationId },
    create: {
      clerkUserId: clerkId,
      email,
      name,
      platformRole,
      defaultClerkOrganisationId,
    },
  });

  return user;
};



export async function canCurrentUserViewTeam(): Promise<boolean> {
  const clerkUser = await currentUser();
  if (!clerkUser) return false;

  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
    select: { platformRole: true },
  });

  return dbUser?.platformRole === "ORG_ADMIN" || dbUser?.platformRole === "PLATFORM_ADMIN";
}

/**
 * Get the Prisma user for the current session.
 * If the user doesn't exist in the database, it will be created automatically.
 * If the user exists but data is stale, it will be synced from Clerk.
 */
export const getPrismaUserFromClerk = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  
  // Try to find the user first
  let dbUser = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });
  
  // If user doesn't exist, create them
  if (!dbUser) {
    dbUser = await initialiseNewUser();
  } else {
    // User exists - sync important fields from Clerk metadata
    const clerkRole = (clerkUser.privateMetadata?.role as string) || ROLES.DONOR;
    const platformRole = Object.values(Role).includes(clerkRole as Role) 
      ? (clerkRole as Role) 
      : Role.DONOR;
    const defaultClerkOrganisationId = 
      (clerkUser.privateMetadata?.defaultOrganisationId as string) || 
      (clerkUser.privateMetadata?.defaultClerkOrganisationID as string) || 
      null;
    
    // Update if role or org changed
    if (dbUser.platformRole !== platformRole || dbUser.defaultClerkOrganisationId !== defaultClerkOrganisationId) {
      dbUser = await prisma.user.update({
        where: { clerkUserId: clerkUser.id },
        data: { platformRole, defaultClerkOrganisationId },
      });
    }
  }
  
  return dbUser;
};

/**
 * Role-based guard — throws error if user doesn't have allowed roles.
 */
export const requireRole = async (...allowedRoles: string[]) => {
  const user = await getPrismaUserFromClerk();
  if (!user) throw new Error("Not authenticated");
  if (!allowedRoles.includes(user.platformRole)) {
    throw new Error("Unauthorised");
  }
  return user;
};

/**
 * Shortcut: require admin role.
 */
export const requireAdmin = async () => requireRole(ROLES.PLATFORM_ADMIN);
