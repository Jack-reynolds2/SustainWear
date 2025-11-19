import { getMyDonations } from "./actions";

// Component to display recent donations made by the user
export default async function RecentDonations() {
  const donations = await getMyDonations();

  // If no donations, show a message
  if (!donations.length)
    return (
      <p className="text-sm text-gray-500 mt-12">
        No donations yet — submit your first one above!
      </p>
    );

  return (
    <section className="mt-16 w-full max-w-2xl">
      <h2 className="text-2xl font-semibold mb-4">Recent Donations</h2>
     
      {/* List of recent donations */}
      <ul className="space-y-3">
        {donations.map((d: any) => (
          <li key={d.id} className="p-4 border rounded-md shadow-sm">
            <div className="flex items-center gap-4">

              {/* Display donation image or placeholder */}
              {d.shippingQrCodeUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.shippingQrCodeUrl}
                  alt={d.title}
                  className="w-16 h-16 rounded object-cover"
                />
              ) : (
                <div className="w-16 h-16 rounded bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                  No image
                </div>
              )}

              {/* Donation details */}
              <div>
                <p className="font-medium">{d.title}</p>
                <p className="text-sm text-gray-600">
                  {d.category} · {d.condition} · {d.status}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(d.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}