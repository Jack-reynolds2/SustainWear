// sustain-wear/src/app/(authed)/donor/page.tsx

import DonorDashboard from "@/components/Dashboards/DonorDashboard";
import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";
import { getMyDonations } from "@/features/actions/donateCRUD";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export default async function DonorPage() {
  const dbUser = await getPrismaUserFromClerk();
  const role: Role | "GUEST" = (dbUser?.platformRole as Role) ?? "GUEST";

  // Optional: block non-donors from hitting /donor directly
  if (role !== "DONOR") {
    return redirect("/dashboard");
  }

  const donations = await getMyDonations();

  return (
    <main className="mx-auto max-w-6xl py-8">
      <DonorDashboard donations={donations} />
    </main>
  );
}
