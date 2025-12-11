// src/app/(authed)/dashboard/page.tsx

import React from "react";
import { redirect } from "next/navigation";
import { Role } from "@prisma/client";

import DonorDashboard from "@/components/Dashboards/DonorDashboard";
import CharityDashboard from "@/components/Dashboards/CharityDashboard";
import SystemAdminDashboard from "@/components/Dashboards/SystemAdminDashboard";

import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";
import { getMyDonations } from "@/features/actions/donateCRUD";
import {
  getApprovedDonations,
  getSubmittedDonations,
} from "@/features/donations/charityActions";
import {
  getCharityApplications,
  getAllCharitiesWithCounts,
} from "@/features/actions/CharityApplication";
import { getAllUsers } from "@/features/actions/users";
import { getTeamMembers } from "@/features/actions/teamActions";
import { prisma } from "@/lib/prisma";

export default async function Page() {
  const dbUser = await getPrismaUserFromClerk();
  const role: Role | "GUEST" = (dbUser?.platformRole as Role) ?? "GUEST";

  console.log("Dashboard - dbUser:", dbUser);
  console.log("Dashboard - role:", role);

  // DONOR - donor dashboard
  if (role === "DONOR") {
    const donations = await getMyDonations();
    return (
      <OuterShell>
        <DonorDashboard donations={donations} />
      </OuterShell>
    );
  }

  // ORG_STAFF / ORG_ADMIN - charity dashboard
  if (role === "ORG_STAFF" || role === "ORG_ADMIN") {
    // only ORG_ADMIN can see team tab
    const canViewTeam = role === "ORG_ADMIN";
    
    // Get the organisation for this user first
    let organisationId: string | undefined;
    let teamMembers: Awaited<ReturnType<typeof getTeamMembers>> = [];
    
    if (dbUser?.defaultClerkOrganisationId) {
      // Find the organisation in our DB by Clerk org ID
      const org = await prisma.organisation.findFirst({
        where: { clerkOrganisationId: dbUser.defaultClerkOrganisationId },
      });
      
      if (org) {
        organisationId = org.id;
        
        // Only fetch team members if user can view them
        if (canViewTeam) {
          teamMembers = await getTeamMembers(organisationId);
        }
      }
    }
    
    // Fetch donations for this organisation (includes donations to all charities)
    const submittedDonations = await getSubmittedDonations(organisationId);
    const approvedDonations = await getApprovedDonations(organisationId);
    
    return (
      <OuterShell>
        <CharityDashboard
          canViewTeam={canViewTeam}
          donations={submittedDonations}
          inventoryItems={approvedDonations}
          organisationId={organisationId}
          initialTeamMembers={teamMembers}
        />
      </OuterShell>
    );
  }

  // PLATFORM_ADMIN - system admin dashboard
  if (role === "PLATFORM_ADMIN") {
    // Fetch admin data in parallel
    const [applicationsResult, charitiesResult, usersResult] = await Promise.all([
      getCharityApplications(),
      getAllCharitiesWithCounts(),
      getAllUsers(),
    ]);

    const initialApplications = applicationsResult;
    const initialCharities = charitiesResult;
    const initialUsers = usersResult.success ? usersResult.users : [];

    console.log("Dashboard - Users fetched:", initialUsers?.length);

    return (
      <OuterShell>
        <SystemAdminDashboard
          initialApplications={initialApplications}
          initialCharities={initialCharities}
          initialUsers={initialUsers}
        />
      </OuterShell>
    );
  }

  // anyone else - unauthorised
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
