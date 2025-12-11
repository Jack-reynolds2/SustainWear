"use client";


import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Donation, User, DonationStatus } from "@prisma/client";
import { useState } from "react";
import DonationDetailsModal from "../Modals/DonationDetailsModal";
import InventoryItemModal from "../Modals/InventoryItemModal";
import InviteTeamMemberModal from "../Modals/InviteTeamMemberModal";
import { TeamMember, removeTeamMember, updateTeamMemberRole, getTeamMembers } from "@/features/actions/teamActions";
import { toast } from "sonner";
import { MoreHorizontal, UserPlus } from "lucide-react";

type DonationWithDonor = Donation & { donor: User | null };

type CharityDashboardProps = {
  /** true = Charity Admin, can see Team tab; false = Charity Staff, no Team tab */
  canViewTeam: boolean;
  donations: DonationWithDonor[];
  inventoryItems: DonationWithDonor[];
  /** Organisation ID for team management */
  organisationId?: string;
  /** Initial team members data */
  initialTeamMembers?: TeamMember[];
};

export default function CharityDashboard({
  canViewTeam,
  donations,
  inventoryItems,
  organisationId,
  initialTeamMembers = [],
}: CharityDashboardProps) {
  const [donationSearch, setDonationSearch] = useState("");
  const [donationStatusFilter, setDonationStatusFilter] = useState<
    DonationStatus | "ALL"
  >("ALL");
  const [selectedDonation, setSelectedDonation] =
    useState<DonationWithDonor | null>(null);
  
  // Inventory item details modal state
  const [selectedInventoryItem, setSelectedInventoryItem] =
    useState<DonationWithDonor | null>(null);

  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

  // Once wired up, filter `donations` here (for now it's just the empty array)
  const filteredDonations = donations.filter(
    (d) =>
      (donationStatusFilter === "ALL" || d.status === donationStatusFilter) &&
      (d.title.toLowerCase().includes(donationSearch.toLowerCase()) ||
        d.donor?.name?.toLowerCase().includes(donationSearch.toLowerCase()))
  );

  // Refresh team members list
  const refreshTeamMembers = async () => {
    if (!organisationId) return;
    const members = await getTeamMembers(organisationId);
    setTeamMembers(members);
  };

  // Handle removing a team member
  const handleRemoveMember = async (userId: string, memberName: string) => {
    if (!organisationId) return;
    
    const result = await removeTeamMember({ organisationId, userId });
    if (result.success) {
      toast.success(`${memberName} has been removed from the team`);
      refreshTeamMembers();
    } else {
      toast.error(result.error || "Failed to remove team member");
    }
  };

  // Handle changing a team member's role
  const handleChangeRole = async (userId: string, newRole: "org:admin" | "org:member") => {
    if (!organisationId) return;
    
    const result = await updateTeamMemberRole({ organisationId, userId, newRole });
    if (result.success) {
      toast.success("Role updated successfully");
      refreshTeamMembers();
    } else {
      toast.error(result.error || "Failed to update role");
    }
  };

  return (
    <>
      <DonationDetailsModal
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
        donation={selectedDonation}
      />
      <InventoryItemModal
        isOpen={!!selectedInventoryItem}
        onClose={() => setSelectedInventoryItem(null)}
        item={selectedInventoryItem}
      />
      <div className="space-y-6">
        {/* Page header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Charity Dashboard
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage incoming donations, inventory{canViewTeam && " and your charity team"}.
            </p>
          </div>
        </div>

        {/* Overview cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {donations.filter(d => d.status === "SUBMITTED").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Under review</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {donations.filter(d => d.status === "UNDER_REVIEW").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {donations.filter(d => d.status === "APPROVED").length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {donations.filter(d => d.status === "REJECTED").length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main content tabs */}
        <Tabs defaultValue="donations" className="space-y-4">
          <TabsList>
            <TabsTrigger value="donations">Donations</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            {canViewTeam && <TabsTrigger value="team">Team</TabsTrigger>}
          </TabsList>

          {/* Donations tab */}
          <TabsContent value="donations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Incoming donations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <Input
                    placeholder="Search by item, donor, or reference…"
                    value={donationSearch}
                    onChange={(e) => setDonationSearch(e.target.value)}
                    className="md:max-w-xs"
                  />

                  <div className="flex items-center gap-2">
                    <Select
                      value={donationStatusFilter}
                      onValueChange={(v) =>
                        setDonationStatusFilter(v as DonationStatus | "ALL")
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All statuses</SelectItem>
                        <SelectItem value="SUBMITTED">Submitted</SelectItem>
                        <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                        <SelectItem value="APPROVED">Approved</SelectItem>
                        <SelectItem value="REJECTED">Rejected</SelectItem>
                      </SelectContent>
                    </Select>

                    {/* Placeholder for e.g. bulk actions later */}
                    <Button variant="outline">Export donations</Button>
                  </div>
                </div>

                {/* Donations table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Donor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Submitted</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDonations.length > 0 ? (
                        filteredDonations.map((donation) => (
                          <TableRow
                            key={donation.id}
                            onClick={() => setSelectedDonation(donation)}
                            className="cursor-pointer hover:bg-muted/50"
                          >
                            <TableCell className="font-medium">{donation.title}</TableCell>
                            <TableCell>{donation.donor?.name}</TableCell>
                            <TableCell>
                              <StatusBadge status={donation.status as any} />
                            </TableCell>
                            <TableCell>{donation.category}</TableCell>
                            <TableCell>{donation.condition}</TableCell>
                            <TableCell suppressHydrationWarning>
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            No donations to display yet. Connect this view to your
                            donation data to see new items here.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Click on a donation row to view details and update its status.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory tab */}
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventory overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Last updated</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inventoryItems.length > 0 ? (
                        inventoryItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.title}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{item.condition}</TableCell>
                            <TableCell>In Stock</TableCell>
                            <TableCell>1</TableCell>
                            <TableCell suppressHydrationWarning>
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => setSelectedInventoryItem(item)}
                              >
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="py-6 text-center text-sm text-muted-foreground"
                          >
                            No inventory items to display yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team tab – only for admins */}
          {canViewTeam && (
            <TabsContent value="team" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Charity team</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={() => setInviteModalOpen(true)}
                    disabled={!organisationId}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite team member
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {teamMembers.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              No team members to display yet. Invite someone to get started!
                            </TableCell>
                          </TableRow>
                        ) : (
                          teamMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">
                                {member.name}
                              </TableCell>
                              <TableCell>{member.email}</TableCell>
                              <TableCell>
                                <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                                  {member.role === "admin" ? "Admin" : "Staff"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  Active
                                </Badge>
                              </TableCell>
                              <TableCell suppressHydrationWarning>
                                {new Date(member.joinedAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {member.role === "member" ? (
                                      <DropdownMenuItem
                                        onClick={() => handleChangeRole(member.id, "org:admin")}
                                      >
                                        Promote to Admin
                                      </DropdownMenuItem>
                                    ) : (
                                      <DropdownMenuItem
                                        onClick={() => handleChangeRole(member.id, "org:member")}
                                      >
                                        Demote to Staff
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      onClick={() => handleRemoveMember(member.id, member.name)}
                                      className="text-red-600"
                                    >
                                      Remove from team
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Invite Modal */}
              {organisationId && (
                <InviteTeamMemberModal
                  open={inviteModalOpen}
                  onOpenChange={setInviteModalOpen}
                  organisationId={organisationId}
                  onInviteSuccess={refreshTeamMembers}
                />
              )}
            </TabsContent>
          )}
        </Tabs>
      </div>
    </>
  );
}

/** Optional status badge component */
function StatusBadge({ status }: { status: DonationStatus }) {
  const labelMap: Record<DonationStatus, string> = {
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under review",
    APPROVED: "Approved",
    REJECTED: "Rejected",
    SHIPPED: "Shipped",
    RECEIVED: "Received",
    ARCHIVED: "Archived",
  };

  const variantMap: Record<
    DonationStatus,
    "outline" | "secondary" | "default" | "destructive"
  > = {
    SUBMITTED: "outline",
    UNDER_REVIEW: "secondary",
    APPROVED: "default",
    REJECTED: "destructive",
    SHIPPED: "default",
    RECEIVED: "default",
    ARCHIVED: "secondary",
  };

  return (
    <Badge variant={variantMap[status]} className="text-xs">
      {labelMap[status]}
    </Badge>
  );
}
