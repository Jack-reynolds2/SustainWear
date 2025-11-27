"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { registerDonation } from "../../../../features/actions/donateCRUD";

export default function DonatePage() {
  // Form state
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [image, setImage] = useState<File | null>(null);

  // State for submission status and success message
  const [submitting, setSubmitting] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // Handle form submission and call server action
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;             // prevent double submits
    setSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await registerDonation(formData);
      if (res?.ok) {
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 4000);
      }
    } catch (err) {
      console.error("Donation failed:", err);
    } finally {
      // Keep the button disabled briefly to stop rapid resubmits
      setTimeout(() => setSubmitting(false), 500);
    }
  };

  // Reset form fields
  const handleReset = () => {
    setItemName("");
    setDescription("");
    setCategory("");
    setCondition("");
    setImage(null);
  };

  return (
    <>
      {/* Success message */}
      {showMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-md text-sm">
          Donation submitted successfully
        </div>
      )}

      <main className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col lg:flex-row items-center justify-center px-8 py-16 text-neutral-900 dark:text-neutral-100">
        {/* Left side */}
        <section className="flex-1 max-w-2xl mb-12 lg:mb-0 pr-8">
          <h1 className="text-5xl font-bold mb-4 leading-tight">
            Smarter Donations. <br /> Sustainable Impact.
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Donate pre-loved items easily and help us promote a sustainable impact.
          </p>
        </section>

        {/* Donation Form */}
        <section className="flex-1 max-w-lg bg-white dark:bg-neutral-900 shadow-md rounded-2xl p-10 border border-gray-100 dark:border-neutral-800">
          <h2 className="text-2xl font-semibold text-green-800 dark:text-emerald-400 mb-8">
            Donation Form
          </h2>

          <SignedOut>
            {/* Show sign in prompt if not signed in */}
            <div className="text-center space-y-4">
              <p>Please sign in to make a donation.</p>
              <SignInButton mode="modal">
                <Button className="bg-[#768755] text-white hover:bg-[#5d6944]">
                  Sign in with Clerk
                </Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Item Name */}
              <div>
                <label className="block mb-1 font-medium">Item Name</label>
                <Input
                  name="itemName"
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  required
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block mb-1 font-medium">Upload Image</label>
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setImage(e.target.files ? e.target.files[0] : null)
                  }
                  className="w-full border rounded-md p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block mb-1 font-medium">Description</label>
                <textarea
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 border rounded-md h-24 resize-none dark:bg-neutral-800 dark:border-neutral-700"
                />
              </div>

              {/* Category and Condition dropdowns */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Category</label>
                  <select
                    name="category"
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="w-full border rounded-md p-2 dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    <option value="">Select Category</option>
                    <option value="TOPS">Tops</option>
                    <option value="BOTTOMS">Bottoms</option>
                    <option value="DRESSES">Dresses</option>
                    <option value="OUTERWEAR">Outerwear</option>
                    <option value="SHOES">Shoes</option>
                    <option value="ACCESSORIES">Accessories</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block mb-1 font-medium">Condition</label>
                  <select
                    name="condition"
                    id="condition"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                    className="w-full border rounded-md p-2 dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    <option value="">Condition</option>
                    <option value="NEW">New</option>
                    <option value="LIKE_NEW">Like New</option>
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#5c6d3a] text-white disabled:opacity-60"
                >
                  {submitting ? "Submitting…" : "Submit Donation"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={submitting}
                >
                  Reset
                </Button>

                {/* Dashboard link */}
                <Link href="/dashboard" className="ml-auto">
                  <Button variant="outline">View Dashboard →</Button>
                </Link>
              </div>
            </form>
          </SignedIn>
        </section>
      </main>
    </>
  );
}
