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

  //  Get a Clerk client
  const clerk = await clerkClient();

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

  // Find or create the admin user
  const email = app.contactEmail;
  console.log('Creating user for email:', email);
  console.log('Organization ID:', org.id);
  
  const existingUsersResponse = await clerk.users.getUserList({
    emailAddress: [email],
  });

  
  const existingUsers =
    Array.isArray(existingUsersResponse)
      ? existingUsersResponse
      : existingUsersResponse.data;

  let clerkUserId: string;
  let tempPassword: string | null = null;

  if (existingUsers.length > 0) {
    // upgrade existing user to ORG_ADMIN
    const user = existingUsers[0];
    await clerk.users.updateUser(user.id, {
      privateMetadata: {
        ...(user.privateMetadata || {}),
        role: "ORG_ADMIN",
        defaultOrganisationId: org.id,
      },
    });
    clerkUserId = user.id;
  } else {
    // create new user with temp password
    // split contact name into first/last
    const rawName = app.contactName?.trim() || "Charity Admin";
    const [first, ...rest] = rawName.split(" ");
    const firstName = first || "Charity";
    const lastName = rest.join(" ") || "Admin";

    // simple username based on email/org
    const baseUsername =
      email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "") ||
      makeUniqueSlug(app.orgName).replace(/[^a-z0-9]/g, "");

    const username = `${baseUsername}-${Date.now().toString(36)}`; // ensure uniqueness

    tempPassword = generateTempPassword();

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
      // Use Backend API to update the email address verification status
      const primaryEmail = newUser.emailAddresses.find(
        (e) => e.emailAddress === email
      );
      
      if (primaryEmail) {
        // Use fetch to call Clerk's Backend API directly to verify email
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
      return { success: false, error: "Failed to create user in Clerk", tempPassword: null, loginEmail: null, newOrganisation: null };
    }
  }

  // 6. Add user as organisation admin in Clerk
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

  // 7. Create a corresponding Organisation record in your database
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

    // 8. Mark the application as APPROVED only after everything succeeds
    await prisma.charityApplication.update({
      where: { id: applicationId },
      data: { status: "APPROVED" },
    });

    return { 
      success: true, 
      tempPassword, 
      loginEmail: email, // Return the login email explicitly
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

