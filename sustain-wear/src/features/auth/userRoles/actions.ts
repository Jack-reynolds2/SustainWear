/*features/auth/userRole.ts*/

'use server';

import type { Role } from "@/features/constants/roles";
import { users } from "@/features/actions/users";  
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

/**
 * Fetches the user's role directly from Clerk's privateMetadata.
 * Returns null if the user is not signed in or has no role set.
 */
export async function getUserRole(): Promise<string | null> {
  try {
    // Get the authenticated Clerk user ID from the session
    const { userId } = await auth();

    if (!userId) {
      console.warn("[getUserRole] No user signed in.");
      return null;
    }

    // Fetch the full Clerk user object
    const client = await clerkClient();
    const user = await client.users.getUser(userId);

    if (!user) {
      console.error(`[getUserRole] Clerk user not found for ID: ${userId}`);
      return null;
    }

    // Extract the role from Clerk’s private metadata
    const role = user.privateMetadata?.role;

    if (typeof role === "string" && role.trim() !== "") {
      console.log(`[getUserRole] User role: ${role}`);
      return role;
    }

    console.warn(`[getUserRole] Role not found or invalid for user ${userId}`);
    return null;

  } catch (error) {
    console.error("[getUserRole] Error fetching role from Clerk:", error);
    return null;
  }
}
