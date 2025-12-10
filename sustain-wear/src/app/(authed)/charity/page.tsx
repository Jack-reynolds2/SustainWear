import CharityDashboard from "@/components/Dashboards/CharityDashboard";
import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";
import { Role } from "@prisma/client";

export default async function Page() {
  const dbUser = await getPrismaUserFromClerk();
  const role: Role | "GUEST" = (dbUser?.platformRole as Role) ?? "GUEST";

  const canViewTeam = role === "ORG_ADMIN";
  return (
    <div>
      <CharityDashboard canViewTeam={canViewTeam} />
    </div>
  );
}