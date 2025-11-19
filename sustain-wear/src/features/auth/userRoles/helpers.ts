"use server";

import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "../../../../prisma/client";
import { ROLES } from "../../constants/roles";


/**
 * Ensures the signed-in Clerk user exists in Prisma and returns the prisma user record.
 * Automatically assigns DONOR role by default.
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

  const user = await prisma.user.upsert({
    where: { clerkUserId: clerkId },
    update: { email, name },
    create: {
      clerkUserId: clerkId,
      email,
      name,
      platformRole: ROLES.DONOR, // default to donor
      defaultClerkOrganisationId: null,
    },
  });

  return user;
};

/**
 * Get the Prisma user for the current session.
 */
export const getPrismaUserFromClerk = async () => {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;
  return await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });
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
