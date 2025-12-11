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
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Eye, EyeOff, Copy, Check, Trash2, Users, Package, Building } from "lucide-react";
import { toast } from "sonner";
import {
  getCharityStaff,
  getCharityDonations,
  removeCharityStaff,
  CharityStaffMember,
} from "@/features/actions/CharityApplication";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CharityWithCounts {
  id: string;
  name: string;
  contactName?: string | null;
  contactEmail?: string | null;
  website?: string | null;
  description?: string | null;
  approved: boolean;
  suspended: boolean;
  createdAt: Date;
  staffCount: number;
  donationCount: number;
}

interface CharityManageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  charity: CharityWithCounts | null;
  credentials?: {
    loginEmail: string;
    tempPassword: string;
  } | null;
  onStaffRemoved?: () => void;
}

type StaffMember = {
  id: string;
  clerkUserId: string;
  name: string | null;
  email: string;
  platformRole: string;
  createdAt: Date;
};

type DonationItem = {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  donor: {
    name: string | null;
    email: string;
  } | null;
};

export default function CharityManageModal({
  open,
  onOpenChange,
  charity,
  credentials,
  onStaffRemoved,
}: CharityManageModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState<"email" | "password" | null>(null);
  const [activeTab, setActiveTab] = useState("details");
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [donations, setDonations] = useState<DonationItem[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Auto-hide password after 5 seconds
  useEffect(() => {
    if (showPassword) {
      const timer = setTimeout(() => {
        setShowPassword(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showPassword]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setShowPassword(false);
      setCopied(null);
      setActiveTab("details");
      setStaff([]);
      setDonations([]);
    }
  }, [open]);

  // Load staff when staff tab is selected
  useEffect(() => {
    if (activeTab === "staff" && charity && staff.length === 0) {
      loadStaff();
    }
  }, [activeTab, charity]);

  // Load donations when donations tab is selected
  useEffect(() => {
    if (activeTab === "donations" && charity && donations.length === 0) {
      loadDonations();
    }
  }, [activeTab, charity]);

  const loadStaff = async () => {
    if (!charity) return;
    setLoadingStaff(true);
    try {
      const result = await getCharityStaff(charity.id);
      if (result.success) {
        setStaff(result.staff as StaffMember[]);
      } else {
        toast.error(result.error || "Failed to load staff");
      }
    } catch (error) {
      toast.error("Failed to load staff");
    } finally {
      setLoadingStaff(false);
    }
  };

  const loadDonations = async () => {
    if (!charity) return;
    setLoadingDonations(true);
    try {
      const result = await getCharityDonations(charity.id);
      if (result.success) {
        setDonations(result.donations as DonationItem[]);
      }
    } catch (error) {
      toast.error("Failed to load donations");
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleRemoveStaff = async () => {
    if (!staffToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await removeCharityStaff(staffToDelete.id);
      if (result.success) {
        toast.success(`${staffToDelete.name || staffToDelete.email} removed from charity`);
        setStaff((prev) => prev.filter((s) => s.id !== staffToDelete.id));
        onStaffRemoved?.();
      } else {
        toast.error(result.error || "Failed to remove staff member");
      }
    } catch (error) {
      toast.error("Failed to remove staff member");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
      setStaffToDelete(null);
    }
  };

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-600";
      case "APPROVED":
        return "bg-green-600";
      case "REJECTED":
        return "bg-red-600";
      case "COLLECTED":
        return "bg-blue-600";
      default:
        return "bg-gray-600";
    }
  };

  if (!charity) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
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
              Manage charity details, staff members, and donations
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details" className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                Details
              </TabsTrigger>
              <TabsTrigger value="staff" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Staff ({charity.staffCount})
              </TabsTrigger>
              <TabsTrigger value="donations" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Donations ({charity.donationCount})
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details" className="space-y-4 mt-4">
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
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Staff Members:</span>
                  <span className="col-span-2 font-medium">
                    {charity.staffCount}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="text-muted-foreground">Total Donations:</span>
                  <span className="col-span-2 font-medium">
                    {charity.donationCount}
                  </span>
                </div>
                {charity.description && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Description:</span>
                    <p className="mt-1 text-sm">{charity.description}</p>
                  </div>
                )}
              </div>

              {/* Credentials Section */}
              {credentials && (
                <div className="border-t pt-4 mt-4">
                  <h4 className="text-sm font-semibold mb-3 text-orange-600">
                    Login Credentials (Save these!)
                  </h4>
                  <div className="space-y-3 bg-muted/50 p-3 rounded-md">
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
                          title={
                            showPassword
                              ? "Hide password"
                              : "Show password (auto-hides after 5s)"
                          }
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
                          onClick={() =>
                            handleCopy(credentials.tempPassword, "password")
                          }
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
            </TabsContent>

            {/* Staff Tab */}
            <TabsContent value="staff" className="mt-4">
              {loadingStaff ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading staff members...
                </div>
              ) : staff.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No staff members found.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {staff.map((member) => (
                        <TableRow key={member.id}>
                          <TableCell>{member.name || "—"}</TableCell>
                          <TableCell>{member.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{member.platformRole}</Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(member.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                setStaffToDelete(member);
                                setDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            {/* Donations Tab */}
            <TabsContent value="donations" className="mt-4">
              {loadingDonations ? (
                <div className="py-8 text-center text-muted-foreground">
                  Loading donations...
                </div>
              ) : donations.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No donations yet.
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {donations.map((donation) => (
                        <TableRow key={donation.id}>
                          <TableCell className="font-medium">
                            {donation.title}
                          </TableCell>
                          <TableCell>
                            {donation.donor?.name || donation.donor?.email || "—"}
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(donation.status)}>
                              {donation.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Delete Staff Confirmation */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove{" "}
              <strong>{staffToDelete?.name || staffToDelete?.email}</strong> from
              this charity? They will be demoted to a regular donor and lose access
              to charity management features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveStaff}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Removing..." : "Remove Staff"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
