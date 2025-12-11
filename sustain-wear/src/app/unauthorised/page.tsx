// app/unauthorised/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Countdown timer
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Redirect after 5 seconds
    const timeout = setTimeout(() => {
      router.push("/nonAuthed");
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="text-red-600 text-xl font-bold mb-4">
        You are not authorised to view this page.
      </div>
      <p className="text-muted-foreground">
        Redirecting to login in {countdown} second{countdown !== 1 ? "s" : ""}...
      </p>
    </div>
  );
}
  