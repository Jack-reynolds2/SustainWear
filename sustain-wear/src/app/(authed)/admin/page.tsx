// src/app/(authed)/admin/page.tsx   
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import SystemAdminDashboard from "@/components/Dashboards/SystemAdminDashboard";
import React from "react";
import {
  getCharityApplications,
  getAllCharitiesWithCounts,
} from "@/features/actions/CharityApplication";
import { getAllUsers } from "@/features/actions/users";
import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";

export default async function AdminPage() {
  // Check if user is authenticated
  const { userId } = await auth();
  if (!userId) {
    redirect("/nonAuthed");
  }

  // Check if user is a platform admin
  const dbUser = await getPrismaUserFromClerk();
  if (!dbUser || dbUser.platformRole !== "PLATFORM_ADMIN") {
    redirect("/unauthorised");
  }

  // Fetch initial data in parallel
  const [applicationsResult, charitiesResult, usersResult] = await Promise.all([
    getCharityApplications(),
    getAllCharitiesWithCounts(),
    getAllUsers(),
  ]);

  console.log("Admin page - usersResult:", usersResult);

  // The `getCharityApplications` action already returns the data in the correct shape.
  // No extra mapping is needed here.
  const initialApplications = applicationsResult;

  // Process charities with counts
  const initialCharities = charitiesResult;

  // Process users
  const initialUsers = usersResult.success ? usersResult.users : [];
  
  console.log("Admin page - initialUsers count:", initialUsers?.length);

  return (
    <main className="mx-auto max-w-6xl py-8">

    <SystemAdminDashboard
      initialApplications={initialApplications}
      initialCharities={initialCharities}
      initialUsers={initialUsers}
    />
    </main>
  );
}
