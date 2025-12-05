// src/app/(authed)/admin/page.tsx   
import { prisma } from "@/lib/prisma";
import SystemAdminDashboard from "@/components/Dashboards/SystemAdminDashboard";
import React from "react";
import { CharityApplication } from "@/components/Modals/SysAdminNotificationModal";
import { getApprovedCharities } from "@/features/actions/CharityApplication";



export default async function AdminPage() {
  const apps = await prisma.charityApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const approvedCharities = await getApprovedCharities();

  const mapped: CharityApplication[] = apps.map((a) => ({
    id: a.id,
    name: a.orgName,
    website: a.website,
    contactEmail: a.contactEmail,
    submittedAt: a.createdAt,
    status: a.status as CharityApplication["status"],
    notes: a.message,
  }));

  return (
    <SystemAdminDashboard
      initialApplications={mapped}
      initialCharities={approvedCharities}
    />
  );
}
