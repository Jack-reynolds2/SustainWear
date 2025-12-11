"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

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

interface DonationEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  donation: Donation | null;
  onSave: (formData: FormData) => Promise<{ ok: boolean } | void>;
  onSuccess: () => void;
}

export default function DonationEditModal({
  open,
  onOpenChange,
  donation,
  onSave,
  onSuccess,
}: DonationEditModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState(donation?.title || "");
  const [description, setDescription] = useState(donation?.description || "");
  const [category, setCategory] = useState(donation?.category || "");
  const [condition, setCondition] = useState(donation?.condition || "");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Reset form when donation changes
  useEffect(() => {
    if (donation) {
      setTitle(donation.title);
      setDescription(donation.description || "");
      setCategory(donation.category);
      setCondition(donation.condition);
      setImageFile(null);
    }
  }, [donation]);

  if (!donation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("id", donation.id);
      formData.append("itemName", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("condition", condition);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      await onSave(formData);
      toast.success("Donation updated successfully!");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating donation:", error);
      toast.error("Failed to update donation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Donation</DialogTitle>
          <DialogDescription>
            Make changes to your donation. Only pending donations can be edited.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Image Preview */}
          {donation.imageUrl && (
            <div className="rounded-lg overflow-hidden border">
              <img
                src={donation.imageUrl}
                alt={donation.title}
                className="w-full h-32 object-cover"
              />
              <p className="text-xs text-muted-foreground p-2">Current image</p>
            </div>
          )}

          {/* Item Name */}
          <div className="space-y-2">
            <Label htmlFor="title">Item Name *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md h-20 resize-none dark:bg-neutral-800 dark:border-neutral-700"
            />
          </div>

          {/* Category and Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="w-full border rounded-md p-2 dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option value="TOPS">Tops</option>
                <option value="BOTTOMS">Bottoms</option>
                <option value="DRESSES">Dresses</option>
                <option value="OUTERWEAR">Outerwear</option>
                <option value="SHOES">Shoes</option>
                <option value="ACCESSORIES">Accessories</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition *</Label>
              <select
                id="condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                required
                className="w-full border rounded-md p-2 dark:bg-neutral-800 dark:border-neutral-700"
              >
                <option value="NEW">New</option>
                <option value="LIKE_NEW">Like New</option>
                <option value="GOOD">Good</option>
                <option value="FAIR">Fair</option>
                <option value="POOR">Poor</option>
              </select>
            </div>
          </div>

          {/* New Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="image">Replace Image (optional)</Label>
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full border rounded-md p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
