import Link from "next/link";
import { getMyDonations } from "../donate/actions";

// Donor dashboard page showing donation stats and history
export default async function DonorDashboard() {
  const donations = await getMyDonations();

  // Separate donations into pending and past
  const pending = donations.filter((d: any) => d.status === "SUBMITTED");
  const past = donations.filter((d: any) => d.status !== "SUBMITTED");

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-2">Donor Dashboard</h1>
      <p className="text-gray-600 mb-8">
        Welcome back! Manage your donations and track your impact below.
      </p>

      {/* Summary stats */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h2>Total Donations</h2>
          <p className="text-3xl font-semibold text-green-700 mt-2">
            {donations.length}
          </p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg shadow">
          <h2>Pending</h2>
          <p className="text-3xl font-semibold text-yellow-700 mt-2">
            {pending.length}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h2>CO₂ Reduced</h2>
          <p className="text-3xl font-semibold text-blue-700 mt-2">
            {(donations.length * 2).toFixed(1)} kg
          </p>
        </div>
      </section>

      {/* Navigation back to donation page */}
      <div className="mb-10 text-right">
        <Link
          href="/donate"
          className="inline-block bg-[#768755] text-white px-5 py-2 rounded-md hover:bg-[#5d6944]"
        >
          ← Back to Donate
        </Link>
      </div>

      {/* Donation history tables for pending + past*/}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-10">

        {/* Pending Donations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Pending Donations</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {pending.length ? (
                pending.map((d: any) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3">{d.title}</td>
                    <td className="p-3">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-yellow-700">{d.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-3 text-sm text-gray-500">
                    No pending donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Past Donations */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Past Donations</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left">Item</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {past.length ? (
                past.map((d: any) => (
                  <tr key={d.id} className="border-t">
                    <td className="p-3">{d.title}</td>
                    <td className="p-3">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-green-700">{d.status}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-3 text-sm text-gray-500">
                    No past donations.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
