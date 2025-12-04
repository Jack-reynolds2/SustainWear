"use server";

// // src/features/actions/register.ts

import { prisma } from "@/lib/prisma";

export async function submitCharityRegistration(formData: FormData) {

  const organisationName = formData.get("organisationName") as string;
  const charityNumber = formData.get("charityNumber") as string;
  const contactName = formData.get("contactName") as string;
  const contactEmail = formData.get("contactEmail") as string;
  const website = formData.get("website") as string | null;
  const mission = formData.get("mission") as string | null;

  const messageLines = [
    mission && `Mission: ${mission}`,
    charityNumber && `Charity number: ${charityNumber}`,
  ].filter(Boolean);

  const message = messageLines.length ? messageLines.join("\n") : null;

  await prisma.charityApplication.create({
    data: {
      orgName: organisationName,
      contactName,
      contactEmail,
      website: website || undefined,
      message: message || undefined,
    },
  });
}
