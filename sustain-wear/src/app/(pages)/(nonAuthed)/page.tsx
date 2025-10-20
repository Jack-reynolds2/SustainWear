/* 'use server'

import { ChevronRightIcon } from '@heroicons/react/20/solid'
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import Link from 'next/link';

import Image from 'next/image'

export default async function LandingPage () {

  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
  <div className="relative isolate overflow-hidden bg-white min-h-screen">
      <svg
        aria-hidden="true"
        className="absolute inset-0 -z-10 size-full stroke-gray-200 mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)"
      >
        <defs>
          <pattern
            x="50%"
            y={-1}
            id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
            width={200}
            height={200}
            patternUnits="userSpaceOnUse"
          >
            <path d="M.5 200V.5H200" fill="none" />
          </pattern>
        </defs>
        <rect fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" width="100%" height="100%" strokeWidth={0} />
      </svg>
  <div className="mx-auto max-w-7xl px-6 pt-16 pb-32 sm:pb-40 lg:flex lg:items-center lg:gap-x-12 lg:px-8 lg:py-40">
        {/* Left column: text }
        <div className="mx-auto max-w-2xl lg:mx-0 lg:shrink-0 lg:order-1">
          <div className="mt-24 sm:mt-32 lg:mt-16">
            <a href="#" className="inline-flex space-x-6">
              <span className="rounded-full bg-indigo-600/10 px-3 py-1 text-sm/6 font-semibold text-indigo-600 ring-1 ring-indigo-600/10 ring-inset">
                What's new
              </span>
              <span className="inline-flex items-center space-x-2 text-sm/6 font-medium text-gray-600">
                <span>Just shipped v1.0</span>
                <ChevronRightIcon aria-hidden="true" className="size-5 text-gray-400" />
              </span>
            </a>
          </div>
          <h1 className="mt-10 text-5xl font-semibold tracking-tight text-pretty text-gray-900 sm:text-7xl">
            The Smarter Way to Donate.
          </h1>
          <p className="mt-8 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8">
            SustainWear connects donors and charities, through intelligent, eco-driven technology. Upload, track, and share your donations. Turning fashion waste into smart, sustainable innovation.
          </p>
          <SignedOut>
            <div className="mt-10 flex items-center gap-x-6">
              <SignUpButton>
                <Button className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                  Join the Movement
                </Button>
              </SignUpButton>
              <SignInButton>
                <Button variant="outline" className="rounded-md px-3.5 py-2.5 text-sm font-semibold text-gray-900 shadow-xs hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                    Access Your Donation Hub
                </Button>
              </SignInButton>
            </div>
          </SignedOut>

          <a href="#" className="mt-6 inline-block text-sm font-semibold text-gray-900">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>

        {/* Right column: image }
        <div className="mt-10 lg:mt-0 lg:ml-10 lg:order-2 lg:flex lg:items-center lg:justify-center">
          <div className="rounded-2xl bg-gray-50 p-4 flex items-center justify-center">
            <div className="relative w-80 h-80 sm:w-96 sm:h-96 lg:w-[560px] lg:h-[560px]">
              <Image
                src="/SustainWear.png"
                alt="SustainWear Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    </ClerkProvider>
  )
}
 */
// src/app/(pages)/(nonAuthed)/page.tsx
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "SustainWear — The Smarter Way to Donate",
  description:
    "Donate clothes effortlessly, support charities, and keep textiles out of landfills with SustainWear.",
};

export default async function LandingPage() {
  return (
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

      <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 pb-28 pt-20 sm:pt-28 md:grid-cols-2 lg:gap-16 lg:px-8 lg:py-36">
        {/* Left: Copy */}
        <div className="max-w-2xl animate-in fade-in duration-700">
          {/* pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-950/60 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-indigo-300">
            <span className="inline-block rounded-full bg-emerald-700/90 px-2 py-0.5 text-white">
              What’s new
            </span>
            <span>Just shipped v1.0</span>
          </div>

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

          {/* CTAs (use plain links; Clerk handles /sign-in & /sign-up) */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center rounded-md bg-green-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              aria-label="Create a SustainWear account"
            >
              Join the Movement
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-900 shadow-sm transition hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:hover:bg-neutral-800"
              aria-label="Sign in to your SustainWear dashboard"
            >
              Access Your Donation Hub
            </Link>

            <Link
              href="#how-it-works"
              className="ml-2 text-sm font-semibold text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-100"
            >
              Learn more →
            </Link>
          </div>
        </div>

        {/* Right: Logo / visual */}
        <div className="mx-auto w-full max-w-lg animate-in fade-in slide-in-from-right-4 duration-700 md:max-w-xl">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="relative aspect-square w-full">
              <Image
                src="/SustainWear.png"
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
  );
}
