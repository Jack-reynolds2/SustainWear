// sustain-wear/src/app/debug/DashboardDebugSwitcher.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import DonorDashboard from "@/components/Dashboards/DonorDashboard";
import CharityDashboard from "@/components/Dashboards/CharityDashboard";
import SystemAdminDashboard from "@/components/Dashboards/SystemAdminDashboard";

type Donation = {
  id: string;
  title: string;
  status: string;
  createdAt: string | Date;
};

type DashboardDebugSwitcherProps = {
  donations: Donation[];
};

type View = "DONOR" | "ORG_STAFF" | "ORG_ADMIN" | "PLATFORM_ADMIN";

export default function DashboardDebugSwitcher({
  donations,
}: DashboardDebugSwitcherProps) {
  const [view, setView] = useState<View>("DONOR");

  return (
    <div className="space-y-6">
      {/* Debug controls */}
      <section className="flex flex-wrap items-center justify-between gap-4 rounded-md border bg-background p-4">
        <div>
          <h1 className="text-xl font-semibold">Dashboard Debug Switcher</h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={view === "DONOR" ? "default" : "outline"}
            onClick={() => setView("DONOR")}
          >
            Donor
          </Button>
          <Button
            size="sm"
            variant={view === "ORG_STAFF" ? "default" : "outline"}
            onClick={() => setView("ORG_STAFF")}
          >
            Charity staff
          </Button>
          <Button
            size="sm"
            variant={view === "ORG_ADMIN" ? "default" : "outline"}
            onClick={() => setView("ORG_ADMIN")}
          >
            Charity admin
          </Button>
          <Button
            size="sm"
            variant={view === "PLATFORM_ADMIN" ? "default" : "outline"}
            onClick={() => setView("PLATFORM_ADMIN")}
          >
            System admin
          </Button>
        </div>
      </section>

      {/* Render selected dashboard */}
      <section className="rounded-md border bg-background p-4">
        {view === "DONOR" && <DonorDashboard donations={donations} />}

        {view === "ORG_STAFF" && <CharityDashboard canViewTeam={false} />}

        {view === "ORG_ADMIN" && <CharityDashboard canViewTeam={true} />}

        {view === "PLATFORM_ADMIN" && <SystemAdminDashboard />}
      </section>
    </div>
  );
}
