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
import { approveDonation } from "@/features/donations/charityActions";
import { Donation, User, DonationStatus } from "@prisma/client";
import { startTransition, useState } from "react";
import DonationDetailsModal from "../Modals/DonationDetailsModal";

type DonationWithDonor = Donation & { donor: User | null };

type CharityDashboardProps = {
  /** true = Charity Admin, can see Team tab; false = Charity Staff, no Team tab */
  canViewTeam: boolean;
  donations: DonationWithDonor[];
  inventoryItems: DonationWithDonor[];
};

// Labels only – values will come from server data later
const overviewStats = [
  { label: "Pending donations", value: null },
  { label: "Under review", value: null },
  { label: "Approved", value: null },
  { label: "Declined", value: null },
];

// Empty arrays – to be replaced with real data from server actions
// const donations: any[] = [];
// const inventoryItems: any[] = [];
const teamMembers: any[] = [];

export default function CharityDashboard({
  canViewTeam,
  donations,
  inventoryItems,
}: CharityDashboardProps) {
  const [donationSearch, setDonationSearch] = useState("");
  const [donationStatusFilter, setDonationStatusFilter] = useState<
    DonationStatus | "ALL"
  >("ALL");
  const [selectedDonation, setSelectedDonation] =
    useState<DonationWithDonor | null>(null);

  // Once wired up, filter `donations` here (for now it's just the empty array)
  const filteredDonations = donations.filter(
    (d) =>
      (donationStatusFilter === "ALL" || d.status === donationStatusFilter) &&
      (d.title.toLowerCase().includes(donationSearch.toLowerCase()) ||
        d.donor?.name?.toLowerCase().includes(donationSearch.toLowerCase()))
  );

  const handleApprove = (donationId: string) => {
    startTransition(() => {
      approveDonation(donationId).then(() => {
        setSelectedDonation(null);
      });
    });
  };

  return (
    <>
      <DonationDetailsModal
        isOpen={!!selectedDonation}
        onClose={() => setSelectedDonation(null)}
        donation={selectedDonation}
        onApprove={handleApprove}
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
          {overviewStats.map((stat) => (
            <Card key={stat.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {stat.value === null ? "—" : stat.value}
                </p>
              </CardContent>
            </Card>
          ))}
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
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDonations.length > 0 ? (
                        filteredDonations.map((donation) => (
                          <TableRow
                            key={donation.id}
                            onClick={() => setSelectedDonation(donation)}
                            className="cursor-pointer"
                          >
                            <TableCell>{donation.title}</TableCell>
                            <TableCell>{donation.donor?.name}</TableCell>
                            <TableCell>
                              <StatusBadge status={donation.status as any} />
                            </TableCell>
                            <TableCell>{donation.category}</TableCell>
                            <TableCell>{donation.condition}</TableCell>
                            <TableCell suppressHydrationWarning>
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startTransition(() => {
                                    approveDonation(donation.id);
                                  });
                                }}
                              >
                                Approve
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
                            No donations to display yet. Connect this view to your
                            donation data to see new items here.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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
                              <Button size="sm" variant="outline">
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
                <CardHeader>
                  <CardTitle>Charity team</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-end">
                    <Button variant="outline">Invite team member</Button>
                  </div>

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
                        {teamMembers.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={6}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              No team members to display yet.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
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
