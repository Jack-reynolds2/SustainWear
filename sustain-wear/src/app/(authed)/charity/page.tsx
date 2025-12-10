import CharityDashboard from "@/components/Dashboards/CharityDashboard";
import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";
import {
  getApprovedDonations,
  getSubmittedDonations,
} from "@/features/donations/charityActions";
import { Role } from "@prisma/client";

export default async function Page() {
  const dbUser = await getPrismaUserFromClerk();
  const role: Role | "GUEST" = (dbUser?.platformRole as Role) ?? "GUEST";

  const canViewTeam = role === "ORG_ADMIN";
  const submittedDonations = await getSubmittedDonations();
  const approvedDonations = await getApprovedDonations();
  return (
    <div>


    <main className="mx-auto max-w-6xl py-8">

      <CharityDashboard
        canViewTeam={canViewTeam}
        donations={submittedDonations}
        inventoryItems={approvedDonations}
      />
      </main>
    </div>
  );
}