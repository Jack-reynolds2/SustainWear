"use server";

import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function submitCharityRegistration(formData: FormData) {
  const user = await currentUser();

  const orgName = String(formData.get("orgName") || "");
  const contactName = String(formData.get("contactName") || "");
  const contactEmail = String(formData.get("contactEmail") || "");
  const website = formData.get("website") ? String(formData.get("website")) : null;
  const message = formData.get("message") ? String(formData.get("message")) : null;

  if (!orgName || !contactName || !contactEmail) {
    throw new Error("Missing required fields");
  }

  await prisma.charityApplication.create({
    data: {
      orgName,
      contactName,
      contactEmail,
      website: website || undefined,
      message: message || undefined,
      
    },
  });

  // You can return something to show a success message in the UI
  return { ok: true };
}