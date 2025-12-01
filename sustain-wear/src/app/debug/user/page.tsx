import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/../prisma/client";
import { getPrismaUserFromClerk } from "@/features/auth/userRoles/helpers";

export default async function DebugUser() {
  const clerk = await currentUser();
  const prismaUser = await getPrismaUserFromClerk();

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Debug User Info</h1>

      <div className="border p-4 rounded bg-neutral-100">
        <h2 className="font-semibold">Clerk User</h2>
        <pre className="text-sm whitespace-pre-wrap">
{JSON.stringify(clerk, null, 2)}
        </pre>
      </div>

      <div className="border p-4 rounded bg-neutral-100">
        <h2 className="font-semibold">Prisma User</h2>
        <pre className="text-sm whitespace-pre-wrap">
{JSON.stringify(prismaUser, null, 2)}
        </pre>
      </div>
    </div>
  );
}
