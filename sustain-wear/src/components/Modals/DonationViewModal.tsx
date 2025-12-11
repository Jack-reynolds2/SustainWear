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

type Donation = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  condition: string;
  status: string;
  imageUrl?: string | null;
  createdAt: string | Date;
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
