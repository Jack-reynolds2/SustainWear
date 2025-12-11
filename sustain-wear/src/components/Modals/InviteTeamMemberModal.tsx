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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { inviteTeamMember } from "@/features/actions/teamActions";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

interface InviteTeamMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organisationId: string;
  onInviteSuccess: () => void;
}

export default function InviteTeamMemberModal({
  open,
  onOpenChange,
  organisationId,
  onInviteSuccess,
}: InviteTeamMemberModalProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"org:admin" | "org:member">("org:member");
  const [isLoading, setIsLoading] = useState(false);
  
  // Credentials display state
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState<{ email: string; password: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Auto-hide password after 5 seconds
  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => {
        setShowPassword(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleClose = () => {
    // Reset all state when closing
    setShowCredentials(false);
    setCredentials(null);
    setShowPassword(false);
    setEmail("");
    setName("");
    setRole("org:member");
    onOpenChange(false);
  };

  const handleOpenChange = (isOpen: boolean) => {
    // If showing credentials, don't allow closing via backdrop click or escape
    // User must click "Done" button
    if (showCredentials && !isOpen) {
      return; // Prevent closing
    }
    if (!isOpen) {
      handleClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setIsLoading(true);

    try {
      const result = await inviteTeamMember({
        organisationId,
        email: email.trim(),
        name: name.trim() || undefined,
        role,
      });

      if (result.success) {
        console.log("Invite result:", result); // Debug log
        if (result.isNewUser && result.tempPassword) {
          // Show credentials for new user
          console.log("Showing credentials for new user"); // Debug log
          setCredentials({ email: email.trim(), password: result.tempPassword });
          setShowCredentials(true);
          toast.success("Team member account created!");
          onInviteSuccess();
        } else {
          toast.success("Team member added!", {
            description: `${email} has been added to your team.`,
          });
          onInviteSuccess();
          handleClose();
        }
      } else {
        toast.error(result.error || "Failed to invite team member");
      }
    } catch (error) {
      console.error("Error inviting team member:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        {showCredentials && credentials ? (
          // Show credentials after successful creation
          <>
            <DialogHeader>
              <DialogTitle>Team member created</DialogTitle>
              <DialogDescription>
                Share these login credentials with your new team member. Make sure to copy the password now - it won&apos;t be shown again.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Email field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Email</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={credentials.email}
                    readOnly
                    className="bg-muted"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(credentials.email, "email")}
                  >
                    {copiedField === "email" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Temporary Password</Label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      readOnly
                      className="bg-muted pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(credentials.password, "password")}
                  >
                    {copiedField === "password" ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {showPassword && (
                  <p className="text-xs text-amber-600">
                    Password will be hidden automatically in 5 seconds
                  </p>
                )}
              </div>

              <div className="rounded-md bg-amber-50 border border-amber-200 p-3">
                <p className="text-sm text-amber-800">
                  The team member should change their password after first login.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>
                Done
              </Button>
            </DialogFooter>
          </>
        ) : (
          // Show invite form
          <>
            <DialogHeader>
              <DialogTitle>Invite team member</DialogTitle>
              <DialogDescription>
                Add a new member to your charity team. They&apos;ll receive access to manage donations.
              </DialogDescription>
            </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (optional)</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Smith"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              If not provided, they can set it themselves when they log in.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "org:admin" | "org:member")}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="org:member">Staff Member</SelectItem>
                <SelectItem value="org:admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Admins can manage team members. Staff can only manage donations.
            </p>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Inviting..." : "Invite member"}
            </Button>
          </DialogFooter>
        </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
