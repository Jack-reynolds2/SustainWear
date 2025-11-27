"use client";

import { useState, useMemo } from "react";
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

// --- Mock data – replace with real data from Prisma/API later ---

const overviewStats = [
  { label: "Pending Donations", value: 8 },
  { label: "Approved (Awaiting Collection)", value: 14 },
  { label: "Collected This Week", value: 5 },
  { label: "Declined", value: 2 },
];

type DonationStatus = "PENDING" | "UNDER_REVIEW" | "APPROVED" | "DECLINED" | "COLLECTED";

interface Donation {
  id: string;
  donorName: string;
  itemName: string;
  category: string;
  condition: string;
  status: DonationStatus;
  submittedAt: string;
}

const mockDonations: Donation[] = [
  {
    id: "DN-1045",
    donorName: "Alice Donor",
    itemName: "Winter Coat",
    category: "Outerwear",
    condition: "Good",
    status: "PENDING",
    submittedAt: "2025-11-23",
  },
  {
    id: "DN-1044",
    donorName: "Bob Smith",
    itemName: "Jeans",
    category: "Bottoms",
    condition: "Excellent",
    status: "UNDER_REVIEW",
    submittedAt: "2025-11-22",
  },
  {
    id: "DN-1043",
    donorName: "Claire Green",
    itemName: "Kids T-Shirt Bundle",
    category: "Kidswear",
    condition: "Fair",
    status: "APPROVED",
    submittedAt: "2025-11-21",
  },
  {
    id: "DN-1042",
    donorName: "David Lee",
    itemName: "Formal Dress",
    category: "Occasionwear",
    condition: "Like New",
    status: "COLLECTED",
    submittedAt: "2025-11-20",
  },
];

interface InventoryItem {
  id: string;
  itemName: string;
  category: string;
  condition: string;
  quantity: number;
  location: string;
}

const mockInventory: InventoryItem[] = [
  {
    id: "INV-3001",
    itemName: "Winter Coat",
    category: "Outerwear",
    condition: "Good",
    quantity: 3,
    location: "Main Store – Rail A",
  },
  {
    id: "INV-3002",
    itemName: "Jeans (Mixed Sizes)",
    category: "Bottoms",
    condition: "Excellent",
    quantity: 7,
    location: "Back Room – Shelf B2",
  },
  {
    id: "INV-3003",
    itemName: "Kids T-Shirt Bundle",
    category: "Kidswear",
    condition: "Fair",
    quantity: 10,
    location: "Kids Section – Bin 1",
  },
];

interface Pickup {
  id: string;
  donationId: string;
  donorName: string;
  window: string;
  method: "COLLECTION" | "DROP_OFF";
  status: "SCHEDULED" | "COMPLETED" | "MISSED";
}

const mockPickups: Pickup[] = [
  {
    id: "PK-9001",
    donationId: "DN-1043",
    donorName: "Claire Green",
    window: "27 Nov 2025, 10:00–12:00",
    method: "DROP_OFF",
    status: "SCHEDULED",
  },
  {
    id: "PK-9002",
    donationId: "DN-1042",
    donorName: "David Lee",
    window: "24 Nov 2025, 14:00–16:00",
    method: "COLLECTION",
    status: "COMPLETED",
  },
];

// --- Helpers ---

const statusLabel: Record<DonationStatus, string> = {
  PENDING: "Pending",
  UNDER_REVIEW: "Under Review",
  APPROVED: "Approved",
  DECLINED: "Declined",
  COLLECTED: "Collected",
};

const statusBadgeVariant: Record<DonationStatus, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "outline",
  UNDER_REVIEW: "secondary",
  APPROVED: "default",
  DECLINED: "destructive",
  COLLECTED: "secondary",
};

const pickupStatusColor: Record<Pickup["status"], "outline" | "default" | "secondary" | "destructive"> = {
  SCHEDULED: "outline",
  COMPLETED: "default",
  MISSED: "destructive",
};

// --- Component ---

export default function CharityDashboard() {
  const [donationSearch, setDonationSearch] = useState("");
  const [donationStatusFilter, setDonationStatusFilter] = useState<DonationStatus | "ALL">("ALL");

  const [inventorySearch, setInventorySearch] = useState("");

  const [pickupStatusFilter, setPickupStatusFilter] = useState<Pickup["status"] | "ALL">("ALL");

  const filteredDonations = useMemo(() => {
    return mockDonations.filter((d) => {
      const matchesSearch =
        donationSearch.trim().length === 0 ||
        [d.id, d.donorName, d.itemName, d.category]
          .join(" ")
          .toLowerCase()
          .includes(donationSearch.toLowerCase());
      const matchesStatus =
        donationStatusFilter === "ALL" ? true : d.status === donationStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [donationSearch, donationStatusFilter]);

  const filteredInventory = useMemo(() => {
    return mockInventory.filter((item) => {
      if (!inventorySearch.trim()) return true;
      return (
        [item.itemName, item.category, item.location]
          .join(" ")
          .toLowerCase()
          .includes(inventorySearch.toLowerCase())
      );
    });
  }, [inventorySearch]);

  const filteredPickups = useMemo(() => {
    return mockPickups.filter((p) => {
      if (pickupStatusFilter === "ALL") return true;
      return p.status === pickupStatusFilter;
    });
  }, [pickupStatusFilter]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Charity Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Review donations, manage inventory, and coordinate collections for your organisation.
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Report
          </Button>
          <Button size="sm">New Manual Donation</Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {overviewStats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="donations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="donations">Incoming Donations</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="pickups">Pickups & Drop-offs</TabsTrigger>
        </TabsList>

        {/* Incoming Donations tab */}
        <TabsContent value="donations" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Incoming Donations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Review, approve, or decline donations. Approved items can be added to inventory.
                </p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search by donor, item, or category…"
                    value={donationSearch}
                    onChange={(e) => setDonationSearch(e.target.value)}
                    className="w-full md:w-72"
                  />
                  <Select
                    value={donationStatusFilter}
                    onValueChange={(value: DonationStatus | "ALL") =>
                      setDonationStatusFilter(value)
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="UNDER_REVIEW">Under review</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="COLLECTED">Collected</SelectItem>
                      <SelectItem value="DECLINED">Declined</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Bulk Approve
                  </Button>
                  <Button variant="outline" size="sm">
                    Bulk Decline
                  </Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="hidden md:table-cell">Category</TableHead>
                      <TableHead className="hidden md:table-cell">Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Submitted</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDonations.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="py-8 text-center text-sm text-muted-foreground">
                          No donations match the current filters.
                        </TableCell>
                      </TableRow>
                    )}

                    {filteredDonations.map((donation) => (
                      <TableRow key={donation.id}>
                        <TableCell className="font-mono text-xs md:text-sm">
                          {donation.id}
                        </TableCell>
                        <TableCell>{donation.donorName}</TableCell>
                        <TableCell>{donation.itemName}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {donation.category}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {donation.condition}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusBadgeVariant[donation.status]}>
                            {statusLabel[donation.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {donation.submittedAt}
                        </TableCell>
                        <TableCell className="space-x-1 text-right">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            ✓
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            ✕
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            ⋯
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Inventory</CardTitle>
                <p className="text-sm text-muted-foreground">
                  View items already accepted into stock and where they are located.
                </p>
              </div>
              <Button size="sm" variant="outline">
                Adjust Stock
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Input
                  placeholder="Search inventory…"
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full md:w-72"
                />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Export
                  </Button>
                  <Button size="sm">Add Inventory Item</Button>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Location</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredInventory.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                          No inventory items match your search.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredInventory.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-mono text-xs md:text-sm">
                          {item.id}
                        </TableCell>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell>{item.condition}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{item.location}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pickups tab */}
        <TabsContent value="pickups" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Pickups & Drop-offs</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Coordinate time windows with donors and track completed collections.
                </p>
              </div>
              <Button size="sm">Schedule Pickup</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <Select
                  value={pickupStatusFilter}
                  onValueChange={(value: Pickup["status"] | "ALL") =>
                    setPickupStatusFilter(value)
                  }
                >
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="MISSED">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pickup ID</TableHead>
                      <TableHead>Donation</TableHead>
                      <TableHead>Donor</TableHead>
                      <TableHead>Window</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPickups.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="py-8 text-center text-sm text-muted-foreground">
                          No pickups match the current filters.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredPickups.map((pickup) => (
                      <TableRow key={pickup.id}>
                        <TableCell className="font-mono text-xs md:text-sm">
                          {pickup.id}
                        </TableCell>
                        <TableCell>{pickup.donationId}</TableCell>
                        <TableCell>{pickup.donorName}</TableCell>
                        <TableCell className="text-xs md:text-sm">
                          {pickup.window}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pickup.method === "COLLECTION" ? "Collection" : "Drop-off"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={pickupStatusColor[pickup.status]}>
                            {pickup.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-1">
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            ✓
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8">
                            ⋯
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
