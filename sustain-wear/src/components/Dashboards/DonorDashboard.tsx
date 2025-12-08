// src/components/Dashboards/DonorDashboard.tsx

"use client";

import Link from "next/link";
import DeleteButton from "@/components/ui/DeleteButton";

type Donation = {
  id: string;
  title: string;
  status: string;
  createdAt: string | Date;
};

type DonorDashboardProps = {
  donations: Donation[];
};

// Donor dashboard component showing donation stats and history
export default function DonorDashboard({ donations }: DonorDashboardProps) {
  // Separate donations into pending and past
  const pending = donations.filter((d) => d.status === "SUBMITTED");
  const past = donations.filter((d) => d.status !== "SUBMITTED");

  return (
    <div className="space-y-8">
      {/* Header */}
      <section>
        <h1 className="text-3xl font-bold mb-2">Donor Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back! Manage your donations and track your impact below.
        </p>
      </section>

      {/* Summary stats */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg bg-green-50 p-4 shadow">
          <h2 className="text-sm font-medium text-green-900">
            Total donations
          </h2>
          <p className="mt-2 text-3xl font-semibold text-green-700">
            {donations.length}
          </p>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4 shadow">
          <h2 className="text-sm font-medium text-yellow-900">Pending</h2>
          <p className="mt-2 text-3xl font-semibold text-yellow-700">
            {pending.length}
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 p-4 shadow">
          <h2 className="text-sm font-medium text-blue-900">CO₂ reduced</h2>
          <p className="mt-2 text-3xl font-semibold text-blue-700">
            {(donations.length * 2).toFixed(1)} kg
          </p>
        </div>
      </section>

      {/* Navigation back to donation page */}
      <div className="flex justify-end">
        <Link
          href="/donor/donate"
          className="inline-block rounded-md bg-[#768755] px-5 py-2 text-sm font-medium text-white hover:bg-[#5d6944]"
        >
          ← Back to Donate
        </Link>
      </div>

      {/* Donation history tables for pending + past */}
      <section className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Pending Donations */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Pending donations</h2>
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-medium">Item</th>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-left font-medium">Edit</th>
                <th className="p-3 text-left font-medium">Delete</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {pending.length ? (
                pending.map((d) => (
                  <tr key={d.id} className="border-t">
                    {/* Item */}
                    <td className="p-3">{d.title}</td>

                    {/* Date */}
                    <td className="p-3">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>

                    {/* Edit */}
                    <td className="p-3">
                      <Link
                        href={`/donor/donate/${d.id}/edit`}
                        className="text-sm text-blue-600 underline"
                      >
                        Edit
                      </Link>
                    </td>

                    {/* Delete */}
                    <td className="p-3">
                      <DeleteButton donationId={d.id} />
                    </td>

                    {/* Status */}
                    <td className="p-3 text-yellow-700">{d.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="p-3 text-center text-sm text-gray-500"
                  >
                    No pending donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Past Donations */}
        <div>
          <h2 className="mb-4 text-2xl font-bold">Past donations</h2>
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3 text-left font-medium">Item</th>
                <th className="p-3 text-left font-medium">Date</th>
                <th className="p-3 text-left font-medium">Edit</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {past.length ? (
                past.map((d) => (
                  <tr key={d.id} className="border-t">
                    {/* Item */}
                    <td className="p-3">{d.title}</td>

                    {/* Date */}
                    <td className="p-3">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>

                    {/* Edit */}
                    <td className="p-3">
                      <Link
                        href={`/donor/donate/${d.id}/edit`}
                        className="text-sm text-blue-600 underline"
                      >
                        Edit
                      </Link>
                    </td>

                    {/* Status */}
                    <td className="p-3 text-green-700">{d.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="p-3 text-center text-sm text-gray-500"
                  >
                    No past donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
