"use client";

import Link from "next/link";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import type { ReactNode } from "react";

export default function DonorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <header className="w-full flex justify-between items-center p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="text-2xl font-semibold text-[#768755]">
          <Link href="/dashboard">SustainWear</Link>
        </div>

        {/* Right User Icon (from Clerk) */}
        <SignedIn>
          <UserButton />
        </SignedIn>
      </header>

      {/* Page Content */}
      <main>{children}</main>
    </ClerkProvider>
  );
}
