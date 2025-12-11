"use server";



import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";


function makeUniqueSlug(name: string) {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base}-${Date.now()}`;
}


function generateTempPassword() {
  // Generate a strong password that meets Clerk's requirements
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export async function approveCharityApplication(applicationId: string) {
  // Get the application
  const app = await prisma.charityApplication.findUnique({
    where: { id: applicationId },
  });

  if (!app) {
    return { success: false, error: "Application not found", tempPassword: null, loginEmail: null, newOrganisation: null };
  }

  // Check if already approved - prevent duplicate approvals
  if (app.status === "APPROVED") {
    return { success: false, error: "This application has already been approved", tempPassword: null, loginEmail: null, newOrganisation: null };
  }

  // Check if already rejected
  if (app.status === "REJECTED") {
    return { success: false, error: "This application has been rejected and cannot be approved", tempPassword: null, loginEmail: null, newOrganisation: null };
  }

  if (!app.contactEmail) {
    return { success: false, error: "Application has no contact email", tempPassword: null, loginEmail: null, newOrganisation: null };
  }

  // Get a Clerk client
  const clerk = await clerkClient();

  // Check if email is already in use BEFORE creating the organization
  const email = app.contactEmail;
  const existingUsersResponse = await clerk.users.getUserList({
    emailAddress: [email],
  });

  const existingUsers =
    Array.isArray(existingUsersResponse)
      ? existingUsersResponse
      : existingUsersResponse.data;

  // If user already exists, reject - charity must use a unique email
  if (existingUsers.length > 0) {
    return { 
      success: false, 
      error: "This email is already registered in the system. Charity accounts must use a unique email address not already associated with a donor account.", 
      tempPassword: null, 
      loginEmail: null, 
      newOrganisation: null 
    };
  }

  // Create the Clerk organisation
  const slug = makeUniqueSlug(app.orgName);
  console.log('Creating organization with slug:', slug);

  let org;
  try {
    org = await clerk.organizations.createOrganization({
      name: app.orgName,
      slug,
    });
    console.log('Organization created:', org.id);
  } catch (err: any) {
    console.error("Clerk organization create error:", JSON.stringify(err.errors ?? err, null, 2));
    return { success: false, error: "Failed to create organization in Clerk", tempPassword: null, loginEmail: null, newOrganisation: null };
  }

  // Create new user with temp password
  console.log('Creating user for email:', email);
  console.log('Organization ID:', org.id);

  const rawName = app.contactName?.trim() || "Charity Admin";
  const [first, ...rest] = rawName.split(" ");
  const firstName = first || "Charity";
  const lastName = rest.join(" ") || "Admin";

  const baseUsername =
    email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") ||
    makeUniqueSlug(app.orgName).replace(/[^a-z0-9]/g, "");

  const username = `${baseUsername}-${Date.now().toString(36)}`;

  const tempPassword = generateTempPassword();
  let clerkUserId: string;

  try {
    const newUser = await clerk.users.createUser({
      emailAddress: [email],
      firstName,
      lastName,
      username,
      password: tempPassword,
      skipPasswordChecks: true,
      privateMetadata: {
        role: "ORG_ADMIN",
        defaultOrganisationId: org.id,
      },
    });

    // Manually verify the email so user can log in immediately
    const primaryEmail = newUser.emailAddresses.find(
      (e) => e.emailAddress === email
    );
    
    if (primaryEmail) {
      const verifyResponse = await fetch(
        `https://api.clerk.com/v1/email_addresses/${primaryEmail.id}/verify`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      if (!verifyResponse.ok) {
        console.log("Warning: Could not auto-verify email. User may need to verify manually.");
      } else {
        console.log("Email verified successfully for new charity admin");
      }
    }

    clerkUserId = newUser.id;
  } catch (err: any) {
    console.error(
      "Clerk user create error",
      JSON.stringify(err.errors ?? err, null, 2)
    );
    // Cleanup the organization we created
    try {
      await clerk.organizations.deleteOrganization(org.id);
    } catch (e) {
      console.error("Failed to cleanup organization:", e);
    }
    return { success: false, error: "Failed to create user in Clerk", tempPassword: null, loginEmail: null, newOrganisation: null };
  }

  // Add user as organisation admin in Clerk
  console.log(`Adding user ${clerkUserId} to organization ${org.id} with role 'admin'`);
  try {
    await clerk.organizations.createOrganizationMembership({
      organizationId: org.id,
      userId: clerkUserId,
      role: "org:admin",
    });
    console.log('User added to organization successfully');
  } catch (err: any) {
    console.error(
      "Clerk organization membership error:",
      JSON.stringify(err.errors ?? err, null, 2)
    );
    return { success: false, error: "Failed to add user to organization", tempPassword: null, loginEmail: null, newOrganisation: null };
  }

  // Create a corresponding Organisation record in your database
  try {
    const newOrganisation = await prisma.organisation.create({
      data: {
        clerkOrganisationId: org.id,
        name: app.orgName,
        contactName: app.contactName,
        contactEmail: app.contactEmail,
        approved: true,
        slug: slug,
      },
    });

    // Mark the application as APPROVED only after everything succeeds
    await prisma.charityApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    });

    return { 
      success: true, 
      tempPassword, 
      loginEmail: email,
      newOrganisation 
    };
  } catch (dbError) {
    console.error("Database error creating organisation:", dbError);
    return {
      success: false,
      error: "Failed to save new charity to the database after creating it in Clerk.",
      tempPassword: null,
      loginEmail: null,
      newOrganisation: null,
    };
  }
}

export async function rejectCharityApplication(appId: string) {
  await prisma.charityApplication.update({
    where: { id: appId },
    data: { status: "REJECTED" },
  });
}

export async function getCharityApplications() {
  const apps = await prisma.charityApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return apps.map((a) => ({
    id: a.id,
    name: a.orgName,
    website: a.website,
    contactEmail: a.contactEmail,
    submittedAt: a.createdAt,
    status: a.status,
    notes: a.message,
  }));
}

export async function getApprovedCharities() {
  return prisma.organisation.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteCharity(organisationId: string) {
  try {
    // 1. Find the organisation in your database to get the Clerk ID
    const organisation = await prisma.organisation.findUnique({
      where: { id: organisationId },
    });

    if (!organisation) {
      return { success: false, error: "Organisation not found." };
    }

    const clerk = await clerkClient();

    // 2. Get all members of the organization and delete them from Clerk
    try {
      const memberships = await clerk.organizations.getOrganizationMembershipList({
        organizationId: organisation.clerkOrganisationId,
      });

      // Delete each user from Clerk (GDPR compliance)
      for (const membership of memberships.data) {
        try {
          await clerk.users.deleteUser(membership.publicUserData?.userId || "");
          console.log(`Deleted user ${membership.publicUserData?.userId} from Clerk`);
        } catch (userError: any) {
          // If user not found, continue
          if (userError.status !== 404) {
            console.error(`Failed to delete user ${membership.publicUserData?.userId}:`, userError);
          }
        }
      }
    } catch (memberError: any) {
      console.log("Could not fetch organization members:", memberError.message);
    }

    // 3. Delete the organisation from Clerk
    try {
      await clerk.organizations.deleteOrganization(
        organisation.clerkOrganisationId
      );
    } catch (error: any) {
      // If Clerk returns a 404, it means the org is already gone.
      if (error.status !== 404) {
        throw error;
      }
      console.log(
        `Organisation ${organisation.clerkOrganisationId} not found in Clerk. Proceeding with local deletion.`
      );
    }

    // 4. Delete users from local database that belonged to this organisation
    await prisma.user.deleteMany({
      where: { defaultClerkOrganisationId: organisation.clerkOrganisationId },
    });

    // 5. Delete the organisation from your database
    await prisma.organisation.delete({
      where: { id: organisationId },
    });

    return { success: true };
  } catch (error) {
    console.error("Error deleting charity:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "An unknown error occurred.",
    };
  }
}

/**
 * Suspends a charity organisation.
 */
export async function suspendCharity(organisationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.organisation.update({
      where: { id: organisationId },
      data: { suspended: true },
    });
    return { success: true };
  } catch (error) {
    console.error("Error suspending charity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to suspend charity.",
    };
  }
}

/**
 * Unsuspends a charity organisation.
 */
export async function unsuspendCharity(organisationId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.organisation.update({
      where: { id: organisationId },
      data: { suspended: false },
    });
    return { success: true };
  } catch (error) {
    console.error("Error unsuspending charity:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to unsuspend charity.",
    };
  }
}

/**
 * Gets all charities (approved and suspended).
 */
export async function getAllCharities() {
  const organisations = await prisma.organisation.findMany({
    orderBy: { createdAt: "desc" },
  });
  return organisations;
}

/**
 * Gets all charities with staff and donation counts.
 */
export async function getAllCharitiesWithCounts() {
  // Get all organisations with donation counts
  const organisations = await prisma.organisation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          donations: true,
        },
      },
    },
  });

  // Get staff counts for each organisation (linked via clerkOrganisationId)
  const staffCounts = await Promise.all(
    organisations.map(async (org) => {
      const count = await prisma.user.count({
        where: { defaultClerkOrganisationId: org.clerkOrganisationId },
      });
      return { orgId: org.id, count };
    })
  );

  const staffCountMap = Object.fromEntries(
    staffCounts.map((sc) => [sc.orgId, sc.count])
  );

  return organisations.map((org) => ({
    ...org,
    staffCount: staffCountMap[org.id] || 0,
    donationCount: org._count.donations,
  }));
}

export type CharityWithCounts = Awaited<ReturnType<typeof getAllCharitiesWithCounts>>[number];

/**
 * Gets staff members for a specific charity.
 */
export async function getCharityStaff(organisationId: string) {
  const organisation = await prisma.organisation.findUnique({
    where: { id: organisationId },
    select: { clerkOrganisationId: true },
  });

  if (!organisation) {
    return { success: false, error: "Organisation not found", staff: [] };
  }

  const staff = await prisma.user.findMany({
    where: { defaultClerkOrganisationId: organisation.clerkOrganisationId },
    select: {
      id: true,
      clerkUserId: true,
      name: true,
      email: true,
      platformRole: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { success: true, staff };
}

export type CharityStaffMember = {
  id: string;
  clerkUserId: string;
  name: string | null;
  email: string;
  platformRole: Role;
  createdAt: Date;
};

/**
 * Removes a staff member from a charity.
 */
export async function removeCharityStaff(staffUserId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    // Get the user
    const user = await prisma.user.findUnique({
      where: { id: staffUserId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    if (!user.clerkUserId) {
      return { success: false, error: "User has no Clerk ID" };
    }

    // Get Clerk client
    const clerk = await clerkClient();

    // Remove from Clerk organization membership
    if (user.defaultClerkOrganisationId) {
      try {
        await clerk.organizations.deleteOrganizationMembership({
          organizationId: user.defaultClerkOrganisationId,
          userId: user.clerkUserId,
        });
      } catch (err) {
        console.error("Error removing Clerk membership:", err);
        // Continue even if Clerk removal fails
      }
    }

    // Update user in database - demote to DONOR
    await prisma.user.update({
      where: { id: staffUserId },
      data: {
        defaultClerkOrganisationId: null,
        platformRole: "DONOR",
      },
    });

    // Update Clerk user metadata
    await clerk.users.updateUserMetadata(user.clerkUserId, {
      privateMetadata: {
        role: "DONOR",
        defaultOrganisationId: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Error removing staff member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove staff member.",
    };
  }
}

/**
 * Gets donations for a specific charity.
 */
export async function getCharityDonations(organisationId: string) {
  const donations = await prisma.donation.findMany({
    where: { organisationId },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      donor: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return { success: true, donations };
}

