'use client';
import React from "react";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
  return (
    <header className="w-full flex justify-between items-center p-4 bg-white dark:bg-neutral-900 shadow-sm">
      {/* Logo */}
      <div className="text-2xl font-semibold text-[#768755]">SustainWear</div>

      {/* Navigation links */}
      <nav className="flex space-x-6">
        <Link href="/" className="hover:underline text-gray-700 dark:text-gray-200">
          Home
        </Link>
        <Link
          href="/donate"
          className="hover:underline text-[#768755] font-medium"
        >
          Donate
        </Link>
      </nav>

      <div>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  );
}

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <Header />
      <main>{children}</main>
    </ClerkProvider>
  );
}