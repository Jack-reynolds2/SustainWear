"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Donation, User, DonationStatus } from "@prisma/client";
import Image from "next/image";
import { updateDonationStatus } from "@/features/donations/charityActions";
import { toast } from "sonner";
import { 
  Package,
  Calendar,
  User as UserIcon,
  Tag,
  Sparkles
} from "lucide-react";

type DonationWithDonor = Donation & { donor: User | null };

interface DonationDetailsModalProps {
  donation: DonationWithDonor | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: () => void;
}

export default function DonationDetailsModal({
  donation,
  isOpen,
  onClose,
  onStatusChange,
}: DonationDetailsModalProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!donation) {
    return null;
  }

  const handleStatusChange = async (newStatus: DonationStatus) => {
    setIsUpdating(true);
    try {
      const result = await updateDonationStatus(donation.id, newStatus);
      if (result.success) {
        toast.success(`Donation marked as ${newStatus.toLowerCase().replace(/_/g, " ")}`);
        onStatusChange?.();
        onClose();
      } else {
        toast.error(result.error || "Failed to update status");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: DonationStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-600";
      case "UNDER_REVIEW":
        return "bg-blue-600";
      case "APPROVED":
        return "bg-green-600";
      case "REJECTED":
        return "bg-red-600";
      case "SHIPPED":
        return "bg-purple-600";
      case "RECEIVED":
        return "bg-teal-600";
      case "ARCHIVED":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const formatCondition = (condition: string) => {
    return condition.replace(/_/g, " ");
  };

  // Check if status can be changed (only SUBMITTED or UNDER_REVIEW)
  const canChangeStatus = donation.status === "SUBMITTED" || donation.status === "UNDER_REVIEW";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {donation.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              Submitted by {donation.donor?.name ?? "Unknown"}
            </span>
            <Badge className={getStatusColor(donation.status)}>{donation.status.replace(/_/g, " ")}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Image Section */}
          {donation.imageUrl ? (
            <div className="relative h-64 w-full rounded-lg overflow-hidden bg-muted">
              <Image
                src={donation.imageUrl}
                alt={donation.title}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="h-48 w-full rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No image available</p>
              </div>
            </div>
          )}

          {/* Description */}
          {donation.description && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{donation.description}</p>
            </div>
          )}

          {/* Item Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Category
              </h4>
              <p className="text-sm font-medium">{donation.category}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Condition
              </h4>
              <p className="text-sm font-medium">{formatCondition(donation.condition)}</p>
            </div>

            {donation.brand && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
                <p className="text-sm font-medium">{donation.brand}</p>
              </div>
            )}

            {donation.colour && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Colour</h4>
                <p className="text-sm font-medium">{donation.colour}</p>
              </div>
            )}

            {donation.sizeLabel && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                <p className="text-sm font-medium">{donation.sizeLabel}</p>
              </div>
            )}

            {donation.season && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Season</h4>
                <p className="text-sm font-medium">{donation.season}</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="border-t pt-4 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Submitted: {new Date(donation.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Donor Info */}
          {donation.donor && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Donor Information</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">{donation.donor.name || "—"}</p>
                <p className="text-sm text-muted-foreground">{donation.donor.email}</p>
              </div>
            </div>
          )}

          {/* Status Actions */}
          {canChangeStatus && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">Update Status</h4>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStatusChange("UNDER_REVIEW")}
                  disabled={isUpdating || donation.status === "UNDER_REVIEW"}
                >
                  Under Review
                </Button>
                <Button
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => handleStatusChange("APPROVED")}
                  disabled={isUpdating}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleStatusChange("REJECTED")}
                  disabled={isUpdating}
                >
                  Reject
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
