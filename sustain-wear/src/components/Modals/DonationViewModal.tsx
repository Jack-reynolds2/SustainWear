"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

type Donation = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  condition: string;
  status: string;
  imageUrl?: string | null;
  createdAt: string | Date;
  organisation?: {
    id: string;
    name: string;
  } | null;
};

interface DonationViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation | null;
  onEdit?: () => void;
}

const statusColors: Record<string, string> = {
  SUBMITTED: "bg-yellow-100 text-yellow-800",
  UNDER_REVIEW: "bg-blue-100 text-blue-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  RECEIVED: "bg-emerald-100 text-emerald-800",
  ARCHIVED: "bg-gray-100 text-gray-800",
};

const conditionLabels: Record<string, string> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
};

const categoryLabels: Record<string, string> = {
  TOPS: "Tops",
  BOTTOMS: "Bottoms",
  DRESSES: "Dresses",
  OUTERWEAR: "Outerwear",
  SHOES: "Shoes",
  ACCESSORIES: "Accessories",
  OTHER: "Other",
};

export default function DonationViewModal({
  open,
  onOpenChange,
  donation,
  onEdit,
}: DonationViewModalProps) {
  if (!donation) return null;

  const canEdit = donation.status === "SUBMITTED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{donation.title}</DialogTitle>
          <DialogDescription>
            Submitted on {new Date(donation.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          {donation.imageUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={donation.imageUrl}
                alt={donation.title}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Status:</span>
            <Badge className={statusColors[donation.status] || "bg-gray-100"}>
              {donation.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Charity that accepted - show for approved/shipped/received donations */}
          {donation.organisation && ["APPROVED", "SHIPPED", "RECEIVED"].includes(donation.status) && (
            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Accepted by
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-green-900 dark:text-green-100">
                {donation.organisation.name}
              </p>
            </div>
          )}

          {/* Pending charity - show for submitted/under review */}
          {donation.organisation && ["SUBMITTED", "UNDER_REVIEW"].includes(donation.status) && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Submitted to
                </span>
              </div>
              <p className="mt-1 text-sm font-semibold text-blue-900 dark:text-blue-100">
                {donation.organisation.name}
              </p>
            </div>
          )}

          {/* All Charities option */}
          {!donation.organisation && ["SUBMITTED", "UNDER_REVIEW"].includes(donation.status) && (
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Available to all charities
                </span>
              </div>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Category</span>
              <p>{categoryLabels[donation.category] || donation.category}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Condition</span>
              <p>{conditionLabels[donation.condition] || donation.condition}</p>
            </div>
          </div>

          {/* Description */}
          {donation.description && (
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Description</span>
              <p className="mt-1 text-gray-700 dark:text-gray-300">
                {donation.description}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            {canEdit && onEdit && (
              <Button onClick={onEdit}>
                Edit Donation
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
