// src/components/Dashboards/DonorDashboard.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/components/ui/DeleteButton";
import DonationViewModal from "@/components/Modals/DonationViewModal";
import DonationEditModal from "@/components/Modals/DonationEditModal";
import { updateDonationFromModal } from "@/features/actions/donateCRUD";

type Donation = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  condition: string;
  status: string;
  imageUrl?: string | null;
  createdAt: string | Date;
};

type DonorDashboardProps = {
  donations: Donation[];
};

// Donor dashboard component showing donation stats and history
export default function DonorDashboard({ donations: initialDonations }: DonorDashboardProps) {
  const [donations, setDonations] = useState(initialDonations);
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Separate donations into pending and past
  const pending = donations.filter((d) => d.status === "SUBMITTED");
  const past = donations.filter((d) => d.status !== "SUBMITTED");

  const handleViewDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setViewModalOpen(true);
  };

  const handleEditDonation = (donation: Donation) => {
    setSelectedDonation(donation);
    setEditModalOpen(true);
  };

  const handleEditFromView = () => {
    setViewModalOpen(false);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    // Refresh the page to get updated data
    window.location.reload();
  };

  return (
    <>
      {/* View Modal */}
      <DonationViewModal
        open={viewModalOpen}
        onOpenChange={setViewModalOpen}
        donation={selectedDonation}
        onEdit={handleEditFromView}
      />

      {/* Edit Modal */}
      <DonationEditModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        donation={selectedDonation}
        onSave={updateDonationFromModal}
        onSuccess={handleEditSuccess}
      />

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
          Make a New Donation
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
                  <tr key={d.id} className="border-t hover:bg-gray-50 cursor-pointer">
                    {/* Item - clickable to view */}
                    <td 
                      className="p-3 text-blue-600 hover:underline"
                      onClick={() => handleViewDonation(d)}
                    >
                      {d.title}
                    </td>

                    {/* Date */}
                    <td className="p-3" suppressHydrationWarning>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>

                    {/* Edit */}
                    <td className="p-3">
                      <button
                        onClick={() => handleEditDonation(d)}
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                      >
                        Edit
                      </button>
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
                <th className="p-3 text-left font-medium">View</th>
                <th className="p-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {past.length ? (
                past.map((d) => (
                  <tr key={d.id} className="border-t hover:bg-gray-50 cursor-pointer">
                    {/* Item - clickable to view */}
                    <td 
                      className="p-3 text-blue-600 hover:underline"
                      onClick={() => handleViewDonation(d)}
                    >
                      {d.title}
                    </td>

                    {/* Date */}
                    <td className="p-3" suppressHydrationWarning>
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>

                    {/* View */}
                    <td className="p-3">
                      <button
                        onClick={() => handleViewDonation(d)}
                        className="text-sm text-blue-600 underline hover:text-blue-800"
                      >
                        View
                      </button>
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
    </>
  );
}
