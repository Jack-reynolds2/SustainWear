// src/app/system-admin/page.tsx   (or your actual admin route)
import { prisma } from "@/lib/prisma";
import SystemAdminDashboard from "@/components/Dashboards/SystemAdminDashboard";
import React from "react";
import { CharityApplication } from "@/components/Modals/SysAdminNotificationModal";



export default async function AdminPage() {
  const apps = await prisma.charityApplication.findMany({
    orderBy: { createdAt: "desc" },
  });

  const mapped = apps.map(a => ({
    id: a.id,
    name: a.orgName,
    website: a.website,
    contactEmail: a.contactEmail,
    submittedAt: a.createdAt,
    status: a.status,
    notes: a.message,
  }));

  return <SystemAdminDashboard initialApplications={mapped} />;
}
