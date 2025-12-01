// src/app/(authed)/dashboard/page.tsx

import React from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import DonorDashboard from "@/components/Dashboards/DonorDashboard";
import CharityDashboard from "@/components/Dashboards/CharityDashboard";
import SystemAdminDashboard from "@/components/Dashboards/SystemAdminDashboard";

import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";
import { getMyDonations } from "@/features/actions/donateCRUD";

export default async function Page() {
  const dbUser = await getPrismaUserFromClerk();
  const role: Role | "GUEST" = (dbUser?.platformRole as Role) ?? "GUEST";

  // DONOR → donor dashboard
  if (role === "DONOR") {
    const donations = await getMyDonations();
    return (
      <OuterShell>
        <DonorDashboard donations={donations} />
      </OuterShell>
    );
  }

  // ORG_STAFF / ORG_ADMIN → charity dashboard
  if (role === "ORG_STAFF" || role === "ORG_ADMIN") {
    // only ORG_ADMIN can see team tab
    const canViewTeam = role === "ORG_ADMIN";
    return (
      <OuterShell>
        <CharityDashboard canViewTeam={canViewTeam} />
      </OuterShell>
    );
  }

  // PLATFORM_ADMIN → system admin dashboard
  if (role === "PLATFORM_ADMIN") {
    return (
      <OuterShell>
        <SystemAdminDashboard />
      </OuterShell>
    );
  }

  // anyone else → unauthorised
  return redirect("/unauthorised");
}

function OuterShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 lg:px-0">
        {children}
      </div>
    </div>
  );
}
