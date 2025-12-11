"use client";

import { useState, useEffect } from "react";
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
import { Bell, MoreHorizontal } from "lucide-react";
import React from "react";

import SysAdminNotificitonModal, {
  CharityApplication,
} from "@/components/Modals/SysAdminNotificationModal";

import {
  approveCharityApplication,
  getCharityApplications,
  rejectCharityApplication,
  deleteCharity,
  suspendCharity,
  unsuspendCharity,
  getAllCharities,
  getAllCharitiesWithCounts,
  CharityWithCounts,
} from "@/features/actions/CharityApplication";
import { toast } from "sonner";
import { Organisation } from "@prisma/client";
import DeleteCharityModal from "../Modals/DeleteCharityModal";
import DeleteUserModal from "../Modals/DeleteUserModal";
import CharityManageModal from "../Modals/CharityManageModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getAllUsers,
  EnrichedUser,
  deleteUser,
  suspendUser,
  unsuspendUser,
  syncClerkUsersToDatabase,
} from "@/features/actions/users";
import { RefreshCw } from "lucide-react";

interface Props {
  initialApplications?: CharityApplication[];
  initialCharities?: CharityWithCounts[];
  initialUsers?: EnrichedUser[];
}

// Labels only – values will be calculated from data
const auditLog: any[] = [];

const systemHealth = {
  dbStatus: null as string | null,
  cloudinaryStatus: null as string | null,
  lastErrorAt: null as string | null,
  errorCount24h: null as number | null,
};

export default function SystemAdminDashboard({
  initialApplications,
  initialCharities,
  initialUsers,
}: Props) {
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<string | "ALL">("ALL");

  // User state
  const [users, setUsers] = useState<EnrichedUser[]>(initialUsers || []);
  const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<EnrichedUser | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Charity state
  const [applicationsOpen, setApplicationsOpen] = useState(false);
  const [applications, setApplications] = useState<CharityApplication[]>(
    initialApplications || []
  );
  const [charities, setCharities] = useState<CharityWithCounts[]>(
    initialCharities || []
  );
  const [charitySearch, setCharitySearch] = useState("");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<CharityWithCounts | null>(
    null
  );
  
  // Charity details modal state
  const [charityDetailsOpen, setCharityDetailsOpen] = useState(false);
  const [viewingCharity, setViewingCharity] = useState<CharityWithCounts | null>(null);
  const [charityCredentials, setCharityCredentials] = useState<{
    [charityId: string]: { loginEmail: string; tempPassword: string };
  }>({});

  // Handle suspend/unsuspend charity
  const handleToggleCharitySuspend = async (charity: CharityWithCounts) => {
    const action = charity.suspended ? unsuspendCharity : suspendCharity;
    const actionName = charity.suspended ? "unsuspended" : "suspended";

    // Optimistic update
    setCharities((prev) =>
      prev.map((c) =>
        c.id === charity.id
          ? { ...c, suspended: !charity.suspended }
          : c
      )
    );

    const result = await action(charity.id);
    if (result.success) {
      toast.success(`Charity ${actionName} successfully.`);
    } else {
      // Revert on failure
      setCharities((prev) =>
        prev.map((c) =>
          c.id === charity.id ? { ...c, suspended: charity.suspended } : c
        )
      );
      toast.error(result.error || `Failed to ${actionName.slice(0, -2)} charity.`);
    }
  };

  // Handle suspend/unsuspend user
  const handleToggleSuspend = async (user: EnrichedUser) => {
    const action = user.status === "suspended" ? unsuspendUser : suspendUser;
    const actionName = user.status === "suspended" ? "unsuspended" : "suspended";

    // Optimistic update
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: user.status === "suspended" ? "active" : "suspended" }
          : u
      )
    );

    const result = await action(user.id);
    if (result.success) {
      toast.success(`User ${actionName} successfully.`);
    } else {
      // Revert on failure
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, status: user.status } : u
        )
      );
      toast.error(result.error || `Failed to ${actionName.slice(0, -2)} user.`);
    }
  };

  // Handle sync Clerk users to database
  const handleSyncUsers = async () => {
    setIsSyncing(true);
    try {
      const result = await syncClerkUsersToDatabase();
      if (result.success) {
        toast.success(
          `Sync complete! ${result.created} created, ${result.updated} updated.`
        );
        // Refresh the users list
        const refreshResult = await getAllUsers();
        if (refreshResult.success && refreshResult.users) {
          setUsers(refreshResult.users);
        }
      } else {
        toast.error(result.error || "Failed to sync users.");
      }
    } catch (error) {
      toast.error("An error occurred while syncing users.");
    } finally {
      setIsSyncing(false);
    }
  };

  // Refresh users every 5 minutes
  useEffect(() => {
    const refreshUsers = async () => {
      const result = await getAllUsers();
      if (result.success && result.users) {
        setUsers(result.users);
      }
    };

    const intervalId = setInterval(refreshUsers, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    setCharities(initialCharities || []);
  }, [initialCharities]);

  const pendingApplicationsCount = applications.filter(
    (a) => a.status === "PENDING"
  ).length;

  // Only show PENDING applications in the modal
  const pendingApplications = applications.filter(
    (a) => a.status === "PENDING"
  );

  // Filter users based on search and role
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      userSearch === "" ||
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());

    const matchesRole =
      userRoleFilter === "ALL" || user.role === userRoleFilter;

    return matchesSearch && matchesRole;
  });

  // Filter charities based on search
  const filteredCharities = charities.filter((charity) =>
    charitySearch === "" ||
    charity.name.toLowerCase().includes(charitySearch.toLowerCase()) ||
    charity.contactEmail?.toLowerCase().includes(charitySearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            System Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Global overview of users, charities, and system health.
          </p>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{users.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Charities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{charities.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {applications.filter(a => a.status === "PENDING").length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Charities</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {charities.filter(c => c.approved && !c.suspended).length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main content tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="charities">Charities</TabsTrigger>
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
                      <SelectItem value="ORG_STAFF">
                         Organisation Staff
                      </SelectItem>
                      <SelectItem value="ORG_ADMIN">
                        Organisation Admin
                      </SelectItem>
                      <SelectItem value="PLATFORM_ADMIN">
                        Platform admin
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Sync users button */}
                  <Button
                    variant="outline"
                    onClick={handleSyncUsers}
                    disabled={isSyncing}
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isSyncing ? "animate-spin" : ""}`} />
                    {isSyncing ? "Syncing..." : "Sync Users"}
                  </Button>

                  {/* Placeholder for "New system admin" */}
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
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.name || "—"}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          {user.charity ? user.charity.name : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              user.status === "active"
                                ? "bg-green-600"
                                : "bg-red-600"
                            }
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(user.joinedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleToggleSuspend(user)}
                              >
                                {user.status === "suspended"
                                  ? "Unsuspend User"
                                  : "Suspend User"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedUser(user);
                                  setDeleteUserModalOpen(true);
                                }}
                                className="text-red-600"
                              >
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Delete User Modal */}
          <DeleteUserModal
            open={deleteUserModalOpen}
            onOpenChange={setDeleteUserModalOpen}
            user={selectedUser}
            onConfirmDelete={async (id) => {
              const result = await deleteUser(id);
              if (result.success) {
                toast.success(
                  `User "${selectedUser?.name || selectedUser?.email}" deleted successfully.`
                );
                setUsers((prev) => prev.filter((u) => u.id !== id));
              } else {
                toast.error(
                  result.error || "Failed to delete user. Please try again."
                );
              }
            }}
          />
        </TabsContent>

        {/* Charities tab */}
        <TabsContent value="charities" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Charity organisations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Manage approved charities and review new applications.
                </p>
              </div>

              {/* bell Applications button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setApplicationsOpen(true)}
                className="inline-flex items-center gap-2"
              >
                <Bell className="h-4 w-4" />
                Charity applications
                {pendingApplicationsCount > 0 && (
                  <Badge className="ml-1 text-[10px]">
                    {pendingApplicationsCount} pending
                  </Badge>
                )}
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search bar */}
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <Input
                  placeholder="Search charities by name or email..."
                  value={charitySearch}
                  onChange={(e) => setCharitySearch(e.target.value)}
                  className="md:max-w-xs"
                />
              </div>
              
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
                    {filteredCharities.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={8}
                          className="py-6 text-center text-sm text-muted-foreground"
                        >
                          No charities to display yet.
                        </TableCell>
                      </TableRow>
                    )}
                    {filteredCharities.map((charity) => (
                      <TableRow 
                        key={charity.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setViewingCharity(charity);
                          setCharityDetailsOpen(true);
                        }}
                      >
                        <TableCell>{charity.name}</TableCell>
                        <TableCell>
                          {charity.contactName || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{charity.contactEmail}</TableCell>
                        <TableCell>
                          {charity.suspended ? (
                            <Badge className="bg-red-600">Suspended</Badge>
                          ) : charity.approved ? (
                            <Badge className="bg-green-600">Approved</Badge>
                          ) : (
                            <Badge className="bg-yellow-600">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {charity.staffCount}
                        </TableCell>
                        <TableCell>
                          {charity.donationCount}
                        </TableCell>
                        <TableCell>
                          {new Date(charity.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleToggleCharitySuspend(charity)}
                              >
                                {charity.suspended
                                  ? "Unsuspend Charity"
                                  : "Suspend Charity"}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedCharity(charity);
                                  setDeleteModalOpen(true);
                                }}
                                className="text-red-600"
                              >
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Modal instances */}
          <SysAdminNotificitonModal
            open={applicationsOpen}
            onOpenChange={setApplicationsOpen}
            applications={pendingApplications}
            onRefresh={async () => {
              const freshApplications = await getCharityApplications();
              setApplications(freshApplications);
            }}
            onApprove={async (id) => {
              const application = applications.find((app) => app.id === id);
              if (!application) return;

              // Optimistic UI update
              setApplications((prev) =>
                prev.map((app) =>
                  app.id === id ? { ...app, status: "APPROVED" } : app
                )
              );

              try {
                const result = await approveCharityApplication(id);
                console.log("Approval result:", result);

                if (result.success && result.newOrganisation) {
                  // Store credentials for this charity if available
                  console.log("tempPassword:", result.tempPassword);
                  console.log("loginEmail:", result.loginEmail);
                  
                  // Create the new charity with counts for modal
                  const newCharityWithCounts: CharityWithCounts = {
                    ...result.newOrganisation!,
                    staffCount: 1, // The admin we just created
                    donationCount: 0,
                    _count: { donations: 0 },
                  };
                  
                  if (result.tempPassword && result.loginEmail) {
                    console.log("Storing credentials and opening modal");
                    setCharityCredentials(prev => ({
                      ...prev,
                      [result.newOrganisation!.id]: { 
                        loginEmail: result.loginEmail!, 
                        tempPassword: result.tempPassword! 
                      }
                    }));
                    
                    // Automatically open the charity details modal to show credentials
                    setViewingCharity(newCharityWithCounts);
                    setCharityDetailsOpen(true);
                    setApplicationsOpen(false); // Close the applications modal
                    
                    // New user created - show credentials
                    toast.success("Charity approved successfully!", {
                      description: "View credentials in the modal",
                      duration: 5000,
                    });
                  } else {
                    console.log("No tempPassword - user already existed");
                    // Existing user upgraded - no password to show
                    toast.success("Charity approved successfully!", {
                      description: `User ${result.loginEmail || application.contactEmail} has been upgraded to Charity Admin. They can log in with their existing password.`,
                      duration: 10000,
                    });
                  }

                  // Add the new charity with counts
                  setCharities((prev) => [...prev, newCharityWithCounts]);
                } else {
                  // On failure from the action, revert and show error
                  toast.error(
                    result.error || "Failed to approve charity. Please check logs."
                  );
                  setApplications((prev) =>
                    prev.map((app) =>
                      app.id === id ? { ...app, status: "PENDING" } : app
                    )
                  );
                }
              } catch (error) {
                // On unexpected exception, revert and show generic error
                console.error("Error during charity approval:", error);
                toast.error("An unexpected error occurred. Please try again.");
                setApplications((prev) =>
                  prev.map((app) =>
                    app.id === id ? { ...app, status: "PENDING" } : app
                  )
                );
              }
            }}
            onReject={async (id) => {
              // optimistic UI update
              setApplications((prev) =>
                prev.map((app) =>
                  app.id === id ? { ...app, status: "REJECTED" } : app
                )
              );

              try {
                await rejectCharityApplication(id);
                toast.success("Charity application rejected.");
              } catch (error) {
                console.error(error);
                toast.error("Failed to reject charity. Please try again.");
                // revert optimistic update
                setApplications((prev) =>
                  prev.map((app) =>
                    app.id === id ? { ...app, status: "PENDING" } : app
                  )
                );
              }
            }}
          />

          <DeleteCharityModal
            open={deleteModalOpen}
            onOpenChange={setDeleteModalOpen}
            charity={selectedCharity}
            onConfirmDelete={async (id) => {
              const result = await deleteCharity(id);
              if (result.success) {
                toast.success(
                  `Charity "${selectedCharity?.name}" deleted successfully.`
                );
                setCharities((prev) => prev.filter((c) => c.id !== id));
              } else {
                toast.error(
                  result.error || "Failed to delete charity. Please try again."
                );
              }
            }}
          />

          <CharityManageModal
            open={charityDetailsOpen}
            onOpenChange={setCharityDetailsOpen}
            charity={viewingCharity}
            credentials={viewingCharity ? charityCredentials[viewingCharity.id] : undefined}
            onStaffRemoved={async () => {
              // Refresh charities to update staff count
              const refreshed = await getAllCharitiesWithCounts();
              setCharities(refreshed);
            }}
          />
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
                  <Badge>{systemHealth.dbStatus ?? "Unknown"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Cloudinary</span>
                  <Badge>{systemHealth.cloudinaryStatus ?? "Unknown"}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Errors (last 24h)</span>
                  <span>{systemHealth.errorCount24h ?? "—"}</span>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
