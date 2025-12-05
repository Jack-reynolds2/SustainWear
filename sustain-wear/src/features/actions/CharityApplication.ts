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
  // Generate a stronger password that meets Clerk's requirements
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
    throw new Error("Application not found");
  }

  if (!app.contactEmail) {
    throw new Error("Application has no contact email");
  }

  //  Mark as APPROVED
  await prisma.charityApplication.update({
    where: { id: applicationId },
    data: { status: "APPROVED" },
  });

  //  Get a Clerk client
  const clerk = await clerkClient(); // keep this if your project already uses this pattern

  // Create the Clerk organisation
  const slug = makeUniqueSlug(app.orgName);
  console.log('Creating organization with slug:', slug);

  const org = await clerk.organizations.createOrganization({
    name: app.orgName,
    slug,
  });
  console.log('Organization created:', org.id);

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
        privateMetadata: {
          role: "ORG_ADMIN",
          defaultOrganisationId: org.id,
        },
      });

      clerkUserId = newUser.id;
    } catch (err: any) {
      console.error(
        "Clerk user create error:",
        JSON.stringify(err.errors ?? err, null, 2)
      );
      throw err;
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
    throw err;
  }

  // 7. Create a corresponding Organisation record in your database
  try {
    const newOrganisation = await prisma.organisation.create({
      data: {
        clerkOrganisationId: org.id,
        name: app.orgName,
        contactEmail: app.contactEmail,
        approved: true,
        // Use the same unique slug that was created for the Clerk organization
        slug: slug,
      },
    });

    return { success: true, tempPassword, newOrganisation };
  } catch (dbError) {
    console.error("Database error creating organisation:", dbError);
    // If DB write fails, we should ideally roll back the Clerk user/org creation
    // For now, we'll just return a detailed error.
    return {
      success: false,
      error: "Failed to save new charity to the database after creating it in Clerk.",
      tempPassword: null,
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

    // 2. Attempt to delete the organisation from Clerk
    try {
      const clerk = await clerkClient();
      await clerk.organizations.deleteOrganization(
        organisation.clerkOrganisationId
      );
    } catch (error: any) {
      // If Clerk returns a 404, it means the org is already gone.
      // We can ignore this error and proceed to delete it from our DB.
      if (error.status !== 404) {
        // For any other error, re-throw it to be caught by the outer block.
        throw error;
      }
      console.log(
        `Organisation ${organisation.clerkOrganisationId} not found in Clerk. Proceeding with local deletion.`
      );
    }

    // 3. Delete the organisation from your database
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

