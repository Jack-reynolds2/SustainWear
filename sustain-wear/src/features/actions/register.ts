"use server";

// // src/features/actions/register.ts

import { prisma } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function submitCharityRegistration(formData: FormData) {
  const organisationName = formData.get("organisationName") as string;
  const charityNumber = formData.get("charityNumber") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const website = formData.get("website") as string | null;
  const mission = formData.get("mission") as string | null;

  // Check if email already exists in Clerk (as a donor or any other user)
  try {
    const clerk = await clerkClient();
    const existingUsersResponse = await clerk.users.getUserList({
      emailAddress: [contactEmail],
    });

    const existingUsers = Array.isArray(existingUsersResponse)
      ? existingUsersResponse
      : existingUsersResponse.data;

    if (existingUsers.length > 0) {
      return { 
        success: false, 
        error: "This email is already registered in the system. Please use a different email address for your charity registration." 
      };
    }
  } catch (error) {
    console.error("Error checking existing user:", error);
    // Continue with registration if check fails - will be caught at approval stage
  }

  const messageLines = [
    mission && `Mission: ${mission}`,
    charityNumber && `Charity number: ${charityNumber}`,
  ].filter(Boolean);

  const message = messageLines.length ? messageLines.join("\n") : null;

  const result = await prisma.charityApplication.create({
    data: {
      orgName: organisationName,
      contactName,
      contactEmail,
      website: website || undefined,
      message,
    },
  });

  return { success: true, id: result.id };
}

export async function getCharityApplications() {
  const apps = await prisma.charityApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  return apps.map(a => ({
    id: a.id,
    name: a.orgName,
    website: a.website,
    contactEmail: a.contactEmail,
    submittedAt: a.createdAt,
    status: a.status,
    notes: a.message,
  }));
}

