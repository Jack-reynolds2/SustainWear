"use server";

import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

// Type for team member data
export type TeamMember = {
  id: string; // Clerk user ID
  name: string;
  email: string;
  role: "admin" | "member";
  status: "active" | "pending";
  joinedAt: Date;
  imageUrl?: string;
};

// Generate a temporary password
function generateTempPassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

/**
 * Invite a new team member to the charity organisation
 */
export async function inviteTeamMember({
  organisationId,
  email,
  name,
  role,
}: {
  organisationId: string;
  email: string;
  name?: string;
  role: "org:admin" | "org:member";
}): Promise<{
  success: boolean;
  error?: string;
  isNewUser?: boolean;
  tempPassword?: string;
}> {
  try {
    const clerk = await clerkClient();

    // Get the organisation from our DB to get the Clerk org ID
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      return { success: false, error: "Organisation not found" };
    }

    const clerkOrgId = organisation.clerkOrganisationId;

    // Check if user already exists in Clerk
    const existingUsersResponse = await clerk.users.getUserList({
      emailAddress: [email],
    });

    const existingUsers = Array.isArray(existingUsersResponse)
      ? existingUsersResponse
      : existingUsersResponse.data;

    let clerkUserId: string;
    let isNewUser = false;
    let tempPassword: string | undefined;

    if (existingUsers.length > 0) {
      // User exists - just add them to the organisation
      clerkUserId = existingUsers[0].id;

      // Check if they're already a member of this organisation
      try {
        const existingMembership = await clerk.organizations.getOrganizationMembershipList({
          organizationId: clerkOrgId,
        });

        const alreadyMember = existingMembership.data.some(
          (m) => m.publicUserData?.userId === clerkUserId
        );

        if (alreadyMember) {
          return { success: false, error: "This user is already a member of your team" };
        }
      } catch (e) {
        console.error("Error checking existing membership:", e);
      }

      // Update their role to at least ORG_STAFF if they're just a donor
      const user = existingUsers[0];
      const currentRole = user.privateMetadata?.role as Role | undefined;

      if (!currentRole || currentRole === "DONOR") {
        await clerk.users.updateUser(clerkUserId, {
          privateMetadata: {
            ...user.privateMetadata,
            role: role === "org:admin" ? "ORG_ADMIN" : "ORG_STAFF",
            defaultOrganisationId: clerkOrgId,
          },
        });
      }
    } else {
      // Create new user
      isNewUser = true;
      tempPassword = generateTempPassword();

      const [firstName, ...lastNameParts] = (name || "Team Member").split(" ");
      const lastName = lastNameParts.join(" ") || "";

      const baseUsername = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "");
      const username = `${baseUsername}-${Date.now().toString(36)}`;

      try {
        const newUser = await clerk.users.createUser({
          emailAddress: [email],
          firstName,
          lastName: lastName || undefined,
          username,
          password: tempPassword,
          skipPasswordChecks: true,
          privateMetadata: {
            role: role === "org:admin" ? "ORG_ADMIN" : "ORG_STAFF",
            defaultOrganisationId: clerkOrgId,
          },
        });

        clerkUserId = newUser.id;

        // Also create in our database
        await prisma.user.create({
          data: {
            clerkUserId: newUser.id,
            email,
            name: name || null,
            platformRole: role === "org:admin" ? "ORG_ADMIN" : "ORG_STAFF",
            defaultClerkOrganisationId: clerkOrgId,
          },
        });
      } catch (err: any) {
        console.error("Error creating user:", err);
        return { success: false, error: "Failed to create user account" };
      }
    }

    // Add user to the Clerk organisation
    try {
      await clerk.organizations.createOrganizationMembership({
        organizationId: clerkOrgId,
        userId: clerkUserId,
        role: role,
      });
    } catch (err: any) {
      console.error("Error adding user to organisation:", err);
      return { success: false, error: "Failed to add user to organisation" };
    }

    return {
      success: true,
      isNewUser,
      tempPassword: isNewUser ? tempPassword : undefined,
    };
  } catch (error) {
    console.error("Error inviting team member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Get all team members for an organisation
 */
export async function getTeamMembers(organisationId: string): Promise<TeamMember[]> {
  try {
    const clerk = await clerkClient();

    // Get the organisation from our DB
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      return [];
    }

    // Get all members from Clerk
    const memberships = await clerk.organizations.getOrganizationMembershipList({
      organizationId: organisation.clerkOrganisationId,
    });

    const teamMembers: TeamMember[] = [];

    for (const membership of memberships.data) {
      const userId = membership.publicUserData?.userId;
      if (!userId) continue;

      try {
        const user = await clerk.users.getUser(userId);

        teamMembers.push({
          id: userId,
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown",
          email: user.emailAddresses[0]?.emailAddress || "No email",
          role: membership.role === "org:admin" ? "admin" : "member",
          status: "active",
          joinedAt: new Date(membership.createdAt),
          imageUrl: user.imageUrl,
        });
      } catch (e) {
        console.error(`Error fetching user ${userId}:`, e);
      }
    }

    return teamMembers;
  } catch (error) {
    console.error("Error getting team members:", error);
    return [];
  }
}

/**
 * Remove a team member from the organisation
 */
export async function removeTeamMember({
  organisationId,
  userId,
}: {
  organisationId: string;
  userId: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const clerk = await clerkClient();

    // Get the organisation from our DB
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      return { success: false, error: "Organisation not found" };
    }

    // Remove from Clerk organisation
    try {
      await clerk.organizations.deleteOrganizationMembership({
        organizationId: organisation.clerkOrganisationId,
        userId,
      });
    } catch (err: any) {
      if (err.status !== 404) {
        throw err;
      }
    }

    // Update user's role back to DONOR if they have no other org memberships
    try {
      const user = await clerk.users.getUser(userId);
      const orgMemberships = await clerk.users.getOrganizationMembershipList({
        userId,
      });

      if (orgMemberships.data.length === 0) {
        // No more org memberships - demote to DONOR
        await clerk.users.updateUser(userId, {
          privateMetadata: {
            ...user.privateMetadata,
            role: "DONOR",
            defaultOrganisationId: null,
          },
        });

        // Update in our database too
        await prisma.user.updateMany({
          where: { clerkUserId: userId },
          data: {
            platformRole: "DONOR",
            defaultClerkOrganisationId: null,
          },
        });
      }
    } catch (e) {
      console.error("Error updating user role after removal:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Error removing team member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove team member",
    };
  }
}

/**
 * Update a team member's role
 */
export async function updateTeamMemberRole({
  organisationId,
  userId,
  newRole,
}: {
  organisationId: string;
  userId: string;
  newRole: "org:admin" | "org:member";
}): Promise<{ success: boolean; error?: string }> {
  try {
    const clerk = await clerkClient();

    // Get the organisation from our DB
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      return { success: false, error: "Organisation not found" };
    }

    // Update membership role in Clerk
    await clerk.organizations.updateOrganizationMembership({
      organizationId: organisation.clerkOrganisationId,
      userId,
      role: newRole,
    });

    // Update user's platform role
    const newPlatformRole = newRole === "org:admin" ? "ORG_ADMIN" : "ORG_STAFF";

    const user = await clerk.users.getUser(userId);
    await clerk.users.updateUser(userId, {
      privateMetadata: {
        ...user.privateMetadata,
        role: newPlatformRole,
      },
    });

    // Update in our database
    await prisma.user.updateMany({
      where: { clerkUserId: userId },
      data: { platformRole: newPlatformRole },
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating team member role:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update role",
    };
  }
}
