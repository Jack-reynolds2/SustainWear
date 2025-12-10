// src/features/donations/actions.ts
"use server";

import { prisma } from "../../../prisma/client";
import {
  initialiseNewUser,
  getPrismaUserFromClerk,
} from "@/features/auth/userRoles";
import { ROLES } from "../constants/roles";
import type { DonationStatus, Role as PrismaRole } from "@prisma/client";

export type DonationInput = {
  organisationId?: string | null; // will try to fallback to user's defaultClerkOrganisationId
  title: string;
  description?: string | null;
  brand?: string | null;
  colour?: string | null;
  sizeLabel?: string | null;
  category: string; // string names of Category enum (e.g., "TOPS")
  condition: string; // string names of Condition enum (e.g., "GOOD")
  season?: string | null; // string name of Season enum or null
  // Cloudinary URL returned to client after upload:
  imageUrl?: string | null;
  
  
};

/**
 * Create donation — matches your schema where `organisationId` is required.
 * - If `organisationId` is not passed we try the user's defaultClerkOrganisationId.
 * - Only allowed for DONOR, ORG_STAFF, ORG_ADMIN, PLATFORM_ADMIN as appropriate.
 */
export async function createDonationAction(input: DonationInput) {
  const prismaUser = await initialiseNewUser();

  // Resolve organisationId (required by schema)
  const orgId =
    input.organisationId ??
    (prismaUser.defaultClerkOrganisationId
      ? prismaUser.defaultClerkOrganisationId
      : null);

  if (!orgId) {
    throw new Error(
      "organisationId is required. Provide an organisationId or set defaultClerkOrganisationId on the user's record."
    );
  }

  // Authorisation: allow platform admins, org staff/admin for that org, or donors (depending on your rules)
  // Example: donors can create donations for their default org; org staff/admin can create for the org.
  const allowedRoles = [ROLES.DONOR, ROLES.ORG_STAFF, ROLES.ORG_ADMIN, ROLES.PLATFORM_ADMIN];
  if (!allowedRoles.includes(prismaUser.platformRole as any)) {
    throw new Error("Unauthorised - insufficient role to create donation");
  }

  // Optional: if user is ORG_STAFF or ORG_ADMIN you may want to check they actually belong to the org.
  // For now we create assuming orgId is valid.
  const donation = await prisma.donation.create({
    data: {
      organisationId: orgId,
      donorUserId: prismaUser.id, // nullable in schema but set when available
      title: input.title,
      description: input.description ?? null,
      brand: input.brand ?? null,
      colour: input.colour ?? null,
      sizeLabel: input.sizeLabel ?? null,
      category: input.category as any, // ensure it matches one of Category enum values
      condition: input.condition as any, // ensure it matches Condition enum
      season: input.season as any ?? null,
      status: "SUBMITTED" as DonationStatus, // matches your enum default
      aiCategorySuggestion: null,
      aiConfidenceScore: null,
      aiReviewed: false
    },
  });

  return donation;
}

/**
 * Update donation. Saves imageUrl/shippingQrCodeUrl if provided.
 */
export async function updateDonationAction(donationId: string, input: Partial<DonationInput>) {
  const prismaUser = await initialiseNewUser();

  const donation = await prisma.donation.findUnique({ where: { id: donationId } });
  if (!donation) throw new Error("Donation not found");

  // Permissions: admin or donor who created it or org admin can update
  const isAdmin = prismaUser.platformRole === ROLES.PLATFORM_ADMIN;
  const isOwnerDonor = donation.donorUserId === prismaUser.id;
  const isOrgAdmin = prismaUser.platformRole === ROLES.ORG_ADMIN || prismaUser.platformRole === ROLES.ORG_STAFF;

  if (!isAdmin && !isOwnerDonor && !isOrgAdmin) {
    throw new Error("Unauthorized to update this donation");
  }

  const updated = await prisma.donation.update({
    where: { id: donationId },
    data: {
      title: input.title ?? donation.title,
      description: input.description ?? donation.description,
      brand: input.brand ?? donation.brand,
      colour: input.colour ?? donation.colour,
      sizeLabel: input.sizeLabel ?? donation.sizeLabel,
      category: (input.category ?? donation.category) as any,
      condition: (input.condition ?? donation.condition) as any,
      season: (input.season ?? donation.season) as any,
    },
  });

  return updated;
}
