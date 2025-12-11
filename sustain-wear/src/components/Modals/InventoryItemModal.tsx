"use client";

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
import { Package, Calendar, User as UserIcon, Tag, Sparkles } from "lucide-react";

type DonationWithDonor = Donation & { donor: User | null };

interface InventoryItemModalProps {
  item: DonationWithDonor | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function InventoryItemModal({
  item,
  isOpen,
  onClose,
}: InventoryItemModalProps) {
  if (!item) {
    return null;
  }

  const getStatusColor = (status: DonationStatus) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-600";
      case "APPROVED":
        return "bg-green-600";
      case "REJECTED":
        return "bg-red-600";
      case "SHIPPED":
        return "bg-blue-600";
      case "RECEIVED":
        return "bg-purple-600";
      case "ARCHIVED":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  const formatCondition = (condition: string) => {
    return condition.replace(/_/g, " ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {item.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              Donated by {item.donor?.name ?? "Unknown"}
            </span>
            <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Image Section */}
          {item.imageUrl ? (
            <div className="relative h-64 w-full rounded-lg overflow-hidden bg-muted">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="h-64 w-full rounded-lg bg-muted flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No image available</p>
              </div>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
              <p className="text-sm">{item.description}</p>
            </div>
          )}

          {/* Item Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Category
              </h4>
              <p className="text-sm font-medium">{item.category}</p>
            </div>

            <div className="space-y-1">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Condition
              </h4>
              <p className="text-sm font-medium">{formatCondition(item.condition)}</p>
            </div>

            {item.brand && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Brand</h4>
                <p className="text-sm font-medium">{item.brand}</p>
              </div>
            )}

            {item.colour && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Colour</h4>
                <p className="text-sm font-medium">{item.colour}</p>
              </div>
            )}

            {item.sizeLabel && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                <p className="text-sm font-medium">{item.sizeLabel}</p>
              </div>
            )}

            {item.season && (
              <div className="space-y-1">
                <h4 className="text-sm font-medium text-muted-foreground">Season</h4>
                <p className="text-sm font-medium">{item.season}</p>
              </div>
            )}
          </div>

          {/* Dates */}
          <div className="border-t pt-4 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Donated: {new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Updated: {new Date(item.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Donor Info */}
          {item.donor && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Donor Information</h4>
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium">{item.donor.name || "—"}</p>
                <p className="text-sm text-muted-foreground">{item.donor.email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
