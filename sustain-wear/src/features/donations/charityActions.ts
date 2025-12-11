"use server";

import { revalidatePath } from "next/cache";
import { DonationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

/**
 * Get all donations for a specific charity (all statuses).
 * Shows donations that are either:
 * - Specifically assigned to this charity (organisationId matches)
 * - Available to all charities (organisationId is null)
 */
export async function getAllDonationsForCharity(organisationId?: string) {
  try {
    const whereClause = organisationId 
      ? {
          OR: [
            { organisationId: organisationId },
            { organisationId: { equals: null as unknown as undefined } },
          ],
        }
      : {};

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return donations;
  } catch (error) {
    console.error("Error fetching donations:", error);
    return [];
  }
}

/**
 * Get submitted donations for a specific charity.
 * Shows donations that are either:
 * - Specifically assigned to this charity (organisationId matches)
 * - Available to all charities (organisationId is null)
 */
export async function getSubmittedDonations(organisationId?: string) {
  try {
    const whereClause = organisationId 
      ? {
          status: DonationStatus.SUBMITTED,
          OR: [
            { organisationId: organisationId },
            { organisationId: { equals: null as unknown as undefined } },
          ],
        }
      : { status: DonationStatus.SUBMITTED };

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return donations;
  } catch (error) {
    console.error("Error fetching submitted donations:", error);
    return [];
  }
}

/**
 * Get approved donations for a specific charity.
 * Shows donations that are either:
 * - Specifically assigned to this charity (organisationId matches)
 * - Available to all charities (organisationId is null)
 */
export async function getApprovedDonations(organisationId?: string) {
  try {
    const whereClause = organisationId 
      ? {
          status: DonationStatus.APPROVED,
          OR: [
            { organisationId: organisationId },
            { organisationId: { equals: null as unknown as undefined } },
          ],
        }
      : { status: DonationStatus.APPROVED };

    const donations = await prisma.donation.findMany({
      where: whereClause,
      include: {
        donor: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return donations;
  } catch (error) {
    console.error("Error fetching approved donations:", error);
    return [];
  }
}

export async function approveDonation(donationId: string) {
  try {
    await prisma.donation.update({
      where: {
        id: donationId,
      },
      data: {
        status: DonationStatus.APPROVED,
      },
    });
    revalidatePath("/charity");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error approving donation:", error);
    throw new Error("Failed to approve donation.");
  }
}

/**
 * Update donation status with any valid status
 */
export async function updateDonationStatus(
  donationId: string,
  newStatus: DonationStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.donation.update({
      where: {
        id: donationId,
      },
      data: {
        status: newStatus,
      },
    });
    revalidatePath("/charity");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Error updating donation status:", error);
    return { success: false, error: "Failed to update donation status." };
  }
}
