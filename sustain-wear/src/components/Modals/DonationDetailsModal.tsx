"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Donation, User } from "@prisma/client";
import Image from "next/image";

type DonationWithDonor = Donation & { donor: User | null };

interface DonationDetailsModalProps {
  donation: DonationWithDonor | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (donationId: string) => void;
}

export default function DonationDetailsModal({
  donation,
  isOpen,
  onClose,
  onApprove,
}: DonationDetailsModalProps) {
  if (!donation) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{donation.title}</DialogTitle>
          <DialogDescription>
            Submitted by {donation.donor?.name ?? "Unknown"} on{" "}
            {new Date(donation.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {donation.imageUrl && (
            <div className="relative h-60 w-full">
              <Image
                src={donation.imageUrl}
                alt={donation.title}
                layout="fill"
                objectFit="contain"
              />
            </div>
          )}
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {donation.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">
                Category: {donation.category}
              </Badge>
              <Badge variant="secondary">
                Condition: {donation.condition}
              </Badge>
              {donation.brand && (
                <Badge variant="secondary">
                  Brand: {donation.brand}
                </Badge>
              )}
              {donation.colour && (
                <Badge variant="secondary">
                  Colour: {donation.colour}
                </Badge>
              )}
              {donation.sizeLabel && (
                <Badge variant="secondary">
                  Size: {donation.sizeLabel}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {donation.status === "SUBMITTED" && (
            <Button onClick={() => onApprove(donation.id)}>
              Approve Donation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
