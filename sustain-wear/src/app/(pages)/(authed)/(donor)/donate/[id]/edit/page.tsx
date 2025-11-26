import { getDonationById, updateDonation } from "../../actions"; 

export default async function EditDonationPage({ params }: { params: { id: string } }) {
  const donationId = (await params).id;

  // Fetch the donation
  const donation = await getDonationById(donationId);

  // If not found
  if (!donation) {
    return <p className="p-6">Donation not found.</p>;
  }
  
  // Render the edit form with existing donation data
  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Edit Donation</h1>

      <div className="flex justify-center">
      <form 
        action={updateDonation}
        className ="space-y-6 max-w-lg bg-white dark:bg-neutral-900 shadow-md p-8 rounded-xl"
        >
        <input type="hidden" name="id" value={donation.id} />

        {/* Item Name */}
        <div>
          <label className="block mb-1 font-medium">Item Name</label>
          <input
            type="text"
            name="itemName"
            defaultValue={donation.title}
            className="w-full border border-gray-300 rounded-md p-2"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            name="description"
            defaultValue={donation.description ?? ""}
            className="w-full border rounded-md p-2 h-24"
            />
        </div>

        {/* Category */}
        <div className="flex gap-4">
          <div className ="flex-1">
            <label className="block mb-1 font-medium">Category</label>
            <select
              name="category"
              defaultValue={donation.category}
              className="w-full border rounded-md p-2"
              required
              >
              <option value="TOPS">Tops</option>
              <option value="BOTTOMS">Bottoms</option>
              <option value="DRESSES">Dresses</option>
              <option value="OUTERWEAR">Outerwear</option>
              <option value="SHOES">Shoes</option>
              <option value="ACCESSORIES">Accessories</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Condition */}
          <div className ="flex-1">
            <label className="block mb-1 font-medium">Condition</label>
            <select
              name="condition"
              defaultValue={donation.condition}
              className="w-full border rounded-md p-2"
              required
              >
              <option value="NEW">New</option>
              <option value="LIKE_NEW">Like New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
            </select>
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block mb-1 font-medium">Replace Image (optional)</label>
          <input
            name="image"
            type="file"
            accept="image/*"
            className="w-full border rounded-md p-2"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-green-700 text-white px-4 py-2 rounded-md"
          >
            Save Changes
          </button>

          <a
            href="/dashboard"
            className="px-4 py-2 border rounded-md"
          >
            Cancel
          </a>
        </div>
      </form>
      </div>
    </main>
  );
}
