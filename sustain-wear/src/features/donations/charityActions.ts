"use server";

import { revalidatePath } from "next/cache";
import { DonationStatus } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getSubmittedDonations() {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        status: DonationStatus.SUBMITTED,
      },
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

export async function getApprovedDonations() {
  try {
    const donations = await prisma.donation.findMany({
      where: {
        status: DonationStatus.APPROVED,
      },
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
