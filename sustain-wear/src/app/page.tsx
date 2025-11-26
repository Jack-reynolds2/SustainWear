import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";
import { ROLES } from "@/features/constants/roles";

export default async function HomePage() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    // Not authenticated, redirect to non-authed page
    redirect("/nonAuthed");
  }

  // Authenticated, get user from Prisma
  const user = await getPrismaUserFromClerk();

  if (!user) {
    // User not in DB, perhaps initialize or redirect
    redirect("/nonAuthed");
  }

  // Redirect based on role
  switch (user.platformRole) {
    case ROLES.DONOR:
      redirect("/dashboard");
      break;
    case ROLES.ORG_STAFF:
    case ROLES.ORG_ADMIN:
    case ROLES.PLATFORM_ADMIN:
      redirect("/charity");
      break;
    default:
      redirect("/nonAuthed");
  }
}