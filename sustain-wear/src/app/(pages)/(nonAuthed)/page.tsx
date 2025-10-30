// src/app/(pages)/(nonAuthed)/page.tsx
'use server';

import Layout from "./layout";

import Link from "next/link";
import Image from "next/image";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Button } from "@/components/ui/button";

// export const metadata = {
//   title: "SustainWear — The Smarter Way to Donate",
//   description:
//     "Donate clothes effortlessly, support charities, and keep textiles out of landfills with SustainWear.",
// };

export default async function LandingPage() {
  return (
    // <ClerkProvider>

    <main className="relative isolate overflow-hidden bg-white dark:bg-neutral-950">
      {/* subtle grid background */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 h-full w-full stroke-neutral-200 dark:stroke-neutral-800 mask-[radial-gradient(1200px_600px_at_top_right,white,transparent)]"
      >
        <defs>
          <pattern id="grid" width="200" height="200" patternUnits="userSpaceOnUse" x="50%" y={-1}>
            <path d="M0 200V0H200" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* soft gradient blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 right--10rem h-36rem w-36rem rounded-full bg-linear-to-tr from-emerald-300/30 via-teal-300/30 to-indigo-300/30 blur-3xl dark:from-emerald-500/20 dark:via-teal-500/20 dark:to-indigo-500/20"
      />

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-28 pt-20 sm:pt-28 md:grid-cols-2 lg:gap-5 lg:px-8 lg:py-36">
        {/* Left: Column */}
        <div className="max-w-2xl animate-in fade-in duration-700">


          <h1 className="mt-8 text-5xl font-semibold leading-tight tracking-tight text-neutral-900 dark:text-neutral-50 sm:text-6xl">
            The Smarter Way to Donate.
          </h1>

          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-300 sm:text-xl">
            SustainWear connects donors and charities through intelligent, eco-driven technology.
            Upload, track, and share your donations—turning fashion waste into{" "}
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              smart, sustainable innovation.
            </span>
          </p>

          {/*Clerk handles /sign-in & /sign-up) */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
          <div className="mt-10 relative z-99 flex flex-row flex-wrap items-center gap-4">
            <SignedOut>
                
              
              <SignUpButton mode="modal">
                <Button variant="outline" className="rounded-md bg-[#768755] px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#525e3b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Join the Movement
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                  Access Your Donation Hub
                </Button>
              </SignInButton>
         </SignedOut>

         <SignedIn>
          <UserButton />
         </SignedIn>


          </div>
          <div className="mt-10 relative z-99 flex flex-row flex-wrap items-center gap-4">
            <Button asChild
              variant="outline"

              className="inline-block text-sm font-semibold text-neutral-900 dark:text-emerald-100"
            >
              <Link href="/charity">
                I'm a Charity, Sign Me Up!<span aria-hidden="true">→</span>
              </Link>
            </Button>
          </div>
        </div>
        </div>

        {/* Right: Logo / visual */}
        <div className="mx-auto w-full max-w-lg animate-in fade-in slide-in-from-right-4 duration-700 md:max-w-xl">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative aspect-square w-full">
              <Image
                src="/assets/SustainWear.png"
                alt="SustainWear logo — hanger with recycling leaves"
                fill
                priority
                sizes="(max-width: 768px) 80vw, (max-width: 1200px) 40vw, 560px"
                className="object-contain"
              />
            </div>

          </div>
        </div>
      </section>
    </main>
    // </ClerkProvider>
  );
}
