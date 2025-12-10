// src/app/(authed)/admin/page.tsx   
import { prisma } from "@/lib/prisma";
import SystemAdminDashboard from "@/components/Dashboards/SystemAdminDashboard";
import React from "react";
import { CharityApplication } from "@/components/Modals/SysAdminNotificationModal";
import {
  getCharityApplications,
  getApprovedCharities,
} from "@/features/actions/CharityApplication";
import { getAllUsers } from "@/features/actions/users";

export default async function AdminPage() {
  // Fetch initial data in parallel
  const [applicationsResult, charitiesResult, usersResult] = await Promise.all([
    getCharityApplications(),
    getApprovedCharities(),
    getAllUsers(),
  ]);

  // The `getCharityApplications` action already returns the data in the correct shape.
  // No extra mapping is needed here.
  const initialApplications = applicationsResult;

  // Process approved charities
  const approvedCharities = charitiesResult;

  // Process users
  const initialUsers = usersResult.success ? usersResult.users : [];

  return (
    <SystemAdminDashboard
      initialApplications={initialApplications}
      initialCharities={approvedCharities}
      initialUsers={initialUsers}
    />
  );
}
