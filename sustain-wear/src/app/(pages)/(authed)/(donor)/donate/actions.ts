"use server";

import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { Readable } from "stream";

// Upload function for Cloudinary
async function uploadToCloudinary(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise<{ url: string }>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      { folder: "sustainwear/donations" },
      (err, result) => {
        if (err || !result) reject(err);
        else resolve({ url: result.secure_url });
      }
    );
    Readable.from(buffer).pipe(upload); // converts buffer to readable stream for upload
  });
}

// Action to handle form submission
export async function registerDonation(formData: FormData) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Not signed in");

  const organisationId = process.env.DEFAULT_ORGANISATION_ID || "org_1";

  // Ensure current user exists in Prisma (find or create)
  let user = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: crypto.randomUUID(),
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || "",
        name: `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Pull form data fields
  const title = String(formData.get("itemName") ?? "");
  const description = String(formData.get("description") ?? "");
  const rawCategory = String(formData.get("category") ?? "").toLowerCase();
  const rawCondition = String(formData.get("condition") ?? "").toLowerCase();
  const imageFile = formData.get("image") as File | null;

  // Map raw form values to enum values
  const categoryMap: Record<string, string> = {
    tops: "TOPS",
    bottoms: "BOTTOMS",
    dresses: "DRESSES",
    outerwear: "OUTERWEAR",
    shoes: "SHOES",
    accessories: "ACCESSORIES",
    other: "OTHER",
  };

  const conditionMap: Record<string, string> = {
    new: "NEW",
    "like new": "LIKE_NEW",
    good: "GOOD",
    fair: "FAIR",
    poor: "POOR",
  };

  const category = categoryMap[rawCategory] ?? "OTHER";
  const condition = conditionMap[rawCondition] ?? "GOOD";

  // Upload image if provided
  let imageUrl: string | undefined;
  if (imageFile && imageFile.size > 0) {
    const uploaded = await uploadToCloudinary(imageFile);
    imageUrl = uploaded.url;
  }

  // Create donation record in Prisma
  await prisma.donation.create({
    data: {
      id: crypto.randomUUID(),
      organisationId,
      donorUserId: user.id, // link to actual DB user
      title,
      description,
      category: category as any,
      condition: condition as any,
      status: "SUBMITTED",
      shippingQrCodeUrl: imageUrl, // store image URL (temporary use)
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  return { ok: true }; // returns succes reponse and value to the client
}

// fetch donations linked to current user ID
export async function getMyDonations() {
  const clerkUser = await currentUser();
  if (!clerkUser) return [];

  // find matching user in Prisma
  const dbUser = await prisma.user.findUnique({
    where: { clerkUserId: clerkUser.id },
  });

  if (!dbUser) return [];

  // now fetch donations linked to that Prisma user
  return prisma.donation.findMany({
    where: { donorUserId: dbUser.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}