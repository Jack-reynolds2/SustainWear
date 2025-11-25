"use client";

import { useState } from "react";
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

// Labels only – values will come from server data later
const overviewStats = [
  { label: "Total Users", value: null },
  { label: "Total Charities", value: null },
  { label: "Open Reports", value: null },
  { label: "Pending Donations", value: null },
];

// Empty arrays – to be replaced with real data from server actions
const users: any[] = [];
const charities: any[] = [];
const reports: any[] = [];
const auditLog: any[] = [];

const systemHealth = {
  dbStatus: null as string | null,
  cloudinaryStatus: null as string | null,
  lastErrorAt: null as string | null,
  errorCount24h: null as number | null,
};

export default function SystemAdminDashboardPage() {
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string | "ALL">("ALL");

  // Once you have real data, filter `users` here
  const filteredUsers = users; // currently empty

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Centered content column with side whitespace */}
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-0">
        <div className="space-y-6">
          {/* Page header */}
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">
                System Admin Dashboard
              </h1>
              <p className="text-sm text-muted-foreground">
                Global overview of users, charities, reports, and system health.
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
          <Tabs defaultValue="users" className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="charities">Charities</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            {/* Users tab */}
            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User & role management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Filters */}
                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                    <Input
                      placeholder="Search by name or email..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="md:max-w-xs"
                    />
                    <div className="flex items-center gap-2">
                      <Select
                        value={userRoleFilter}
                        onValueChange={(v) => setUserRoleFilter(v as any)}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Filter by role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">All roles</SelectItem>
                          <SelectItem value="DONOR">Donor</SelectItem>
                          <SelectItem value="CHARITY_STAFF">
                            Charity staff
                          </SelectItem>
                          <SelectItem value="CHARITY_ADMIN">
                            Charity admin
                          </SelectItem>
                          <SelectItem value="SYSTEM_ADMIN">
                            System admin
                          </SelectItem>
                        </SelectContent>
                      </Select>

                      {/* Placeholder for "New sysadmin" etc. */}
                      <Button variant="outline">Invite system admin</Button>
                    </div>
                  </div>

                  {/* Users table */}
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Charity</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Joined</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={7}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              No users to display yet.
                            </TableCell>
                          </TableRow>
                        )}
                        {/* When you have data, map it here */}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Charities tab */}
            <TabsContent value="charities" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Charity organisations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Primary contact</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Staff</TableHead>
                          <TableHead>Donations</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {charities.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              No charities to display yet.
                            </TableCell>
                          </TableRow>
                        )}
                        {/* Map charities here when wired up */}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reports tab */}
            <TabsContent value="reports" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User reports & moderation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Target</TableHead>
                          <TableHead>Reporter</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Created</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {reports.length === 0 && (
                          <TableRow>
                            <TableCell
                              colSpan={8}
                              className="py-6 text-center text-sm text-muted-foreground"
                            >
                              No reports to display yet.
                            </TableCell>
                          </TableRow>
                        )}
                        {/* Map reports here when wired up */}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* System tab */}
            <TabsContent value="system" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>System health</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span>Database (Railway)</span>
                      <Badge>
                        {systemHealth.dbStatus ?? "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Cloudinary</span>
                      <Badge>
                        {systemHealth.cloudinaryStatus ?? "Unknown"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Errors (last 24h)</span>
                      <span>
                        {systemHealth.errorCount24h ?? "—"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Last error at</span>
                      <span className="text-xs text-muted-foreground">
                        {systemHealth.lastErrorAt ?? "—"}
                      </span>
                    </div>
                    <Button className="mt-4" variant="outline" size="sm">
                      Run health check
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Admin audit log</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {auditLog.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        No admin actions recorded yet.
                      </p>
                    )}
                    {/* Map audit log entries here when wired up */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
