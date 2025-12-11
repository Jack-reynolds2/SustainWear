'use client';
import React from "react";
import { SignedIn, UserButton } from "@clerk/nextjs";
import Link from "next/link";

function Header() {
  return (
    <header className="w-full flex justify-between items-center p-4 bg-white dark:bg-neutral-900 shadow-sm">
      {/* Logo */}
      <div className="text-2xl font-semibold text-[#768755]">          
        <Link href="/">SustainWear</Link>
        </div>

      {/* Navigation links */}
      <nav className="flex space-x-6">
      </nav>
      <div>
        <SignedIn>
          <UserButton afterSignOutUrl="/nonAuthed" />
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
    <>
      <Header />
      <main>{children}</main>
    </>
  );
}