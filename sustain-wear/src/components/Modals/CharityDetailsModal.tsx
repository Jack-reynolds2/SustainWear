"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface CharityDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charity: {
    id: string;
    name: string;
    contactName?: string | null;
    contactEmail?: string | null;
    website?: string | null;
    description?: string | null;
    approved: boolean;
    suspended: boolean;
    createdAt: Date;
  } | null;
  credentials?: {
    loginEmail: string;
    tempPassword: string;
  } | null;
}

export default function CharityDetailsModal({
  open,
  onOpenChange,
  charity,
  credentials,
}: CharityDetailsModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  // Auto-hide password after 5 seconds
  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => {
        setShowPassword(false);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setShowPassword(false);
      setCopied(null);
    }
  }, [open]);

  const handleCopy = async (text: string, type: "email" | "password") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast.success(`${type === "email" ? "Email" : "Password"} copied to clipboard`);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const maskPassword = (password: string) => {
    return "•".repeat(password.length);
  };

  if (!charity) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {charity.name}
            {charity.suspended ? (
              <Badge className="bg-red-600">Suspended</Badge>
            ) : charity.approved ? (
              <Badge className="bg-green-600">Approved</Badge>
            ) : (
              <Badge className="bg-yellow-600">Pending</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Charity organisation details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Charity Info */}
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Primary Contact:</span>
              <span className="col-span-2 font-medium">
                {charity.contactName || "—"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="col-span-2 font-medium">
                {charity.contactEmail || "—"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Website:</span>
              <span className="col-span-2 font-medium">
                {charity.website ? (
                  <a
                    href={charity.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {charity.website}
                  </a>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <span className="text-muted-foreground">Created:</span>
              <span className="col-span-2 font-medium">
                {new Date(charity.createdAt).toLocaleDateString()}
              </span>
            </div>
            {charity.description && (
              <div className="text-sm">
                <span className="text-muted-foreground">Description:</span>
                <p className="mt-1 text-sm">{charity.description}</p>
              </div>
            )}
          </div>

          {/* Credentials Section - Only show if credentials exist */}
          {credentials && (
            <div className="border-t pt-4 mt-4">
              <h4 className="text-sm font-semibold mb-3 text-orange-600">
                Login Credentials (Save these!)
              </h4>
              <div className="space-y-3 bg-muted/50 p-3 rounded-md">
                {/* Login Email */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground block">
                      Login Email
                    </span>
                    <span className="text-sm font-mono truncate block">
                      {credentials.loginEmail}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(credentials.loginEmail, "email")}
                  >
                    {copied === "email" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Temporary Password */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-xs text-muted-foreground block">
                      Temporary Password
                    </span>
                    <span className="text-sm font-mono truncate block">
                      {showPassword
                        ? credentials.tempPassword
                        : maskPassword(credentials.tempPassword)}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Hide password" : "Show password (auto-hides after 5s)"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(credentials.tempPassword, "password")}
                    >
                      {copied === "password" ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {showPassword && (
                  <p className="text-xs text-orange-600">
                    Password will be hidden automatically in 5 seconds
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
