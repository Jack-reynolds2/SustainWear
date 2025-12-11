import CharityDashboard from "@/components/Dashboards/CharityDashboard";
import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";
import {
  getApprovedDonations,
  getSubmittedDonations,
} from "@/features/donations/charityActions";
import { getTeamMembers } from "@/features/actions/teamActions";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export default async function Page() {
  const dbUser = await getPrismaUserFromClerk();
  const role: Role | "GUEST" = (dbUser?.platformRole as Role) ?? "GUEST";

  const canViewTeam = role === "ORG_ADMIN";
  const submittedDonations = await getSubmittedDonations();
  const approvedDonations = await getApprovedDonations();
  
  // Get the organisation for this user
  let organisationId: string | undefined;
  let teamMembers: Awaited<ReturnType<typeof getTeamMembers>> = [];
  
  if (dbUser?.defaultClerkOrganisationId) {
    const org = await prisma.organisation.findFirst({
      where: { clerkOrganisationId: dbUser.defaultClerkOrganisationId },
    });
    
    if (org) {
      organisationId = org.id;
      if (canViewTeam) {
        teamMembers = await getTeamMembers(organisationId);
      }
    }
  }
  
  return (
    <div>


    <main className="mx-auto max-w-6xl py-8">

      <CharityDashboard
        canViewTeam={canViewTeam}
        donations={submittedDonations}
        inventoryItems={approvedDonations}
        organisationId={organisationId}
        initialTeamMembers={teamMembers}
      />
      </main>
    </div>
  );
}