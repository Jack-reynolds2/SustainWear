"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function DonatePage() {
  const [itemName, setItemName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [autoCategorized, setAutoCategorized] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  // simple mock AI function
  const handleAutoCategorize = () => {
    setCategory("Clothing");
    setCondition("Gently Used");
    setAutoCategorized(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  const handleReset = () => {
    setItemName("");
    setDescription("");
    setCategory("");
    setCondition("");
    setAutoCategorized(false);
    setSubmitted(false);
  };

  return (
    <>
      {/* top bar */}
      <header className="w-full bg-white dark:bg-neutral-900 border-b border-gray-200 dark:border-neutral-800 p-4 flex justify-between items-center shadow-sm">
        <h1 className="text-xl font-semibold text-[#768755]">SustainWear</h1>
        <Link
          href="/"
          className="text-gray-700 dark:text-gray-200 hover:text-[#768755] text-sm font-medium transition"
        >
          ← Back to Home
        </Link>
      </header>

      {/* success popup */}
      {showMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-md text-sm animate-fade-in">
          ✅ Donation submitted successfully
        </div>
      )}

      <main className="min-h-screen bg-white dark:bg-neutral-950 flex flex-col lg:flex-row items-center justify-center px-8 py-16 text-neutral-900 dark:text-neutral-100">
        {/* left info section */}
        <section className="flex-1 max-w-2xl mb-12 lg:mb-0 pr-8">
          <span className="inline-block bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
            Smart Giving
          </span>
          <h1 className="text-5xl font-bold mb-4 leading-tight text-balance">
            Smarter Donations. <br /> Sustainable Impact.
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            Use AI-powered tools to categorise your donations automatically.
            SustainWear helps you save time and contribute to sustainability
            effortlessly — turning your old items into meaningful change.
          </p>
        </section>

        {/* right form section */}
        <section className="flex-1 max-w-lg bg-white dark:bg-neutral-900 shadow-md rounded-2xl p-10 border border-gray-100 dark:border-neutral-800">
          <h2 className="text-2xl font-semibold text-green-800 dark:text-emerald-400 mb-8">
            Donation Form
          </h2>

          <SignedOut>
            <div className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-300">
                Please sign in to make a donation.
              </p>
              <SignInButton mode="modal">
                <Button className="bg-[#768755] text-white hover:bg-[#5d6944] px-6 py-2">
                  Sign in with Clerk
                </Button>
              </SignInButton>
            </div>
          </SignedOut>

          <SignedIn>
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* item name */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Item Name
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Winter Jacket"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </div>

                {/* upload */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full border rounded-md p-2 text-sm dark:bg-neutral-800 dark:border-neutral-700"
                  />
                </div>

                {/* description */}
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    placeholder="Condition, size, notes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border rounded-md h-24 resize-none dark:bg-neutral-800 dark:border-neutral-700"
                  />
                </div>

                {/* AI categorisation */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    Use AI to categorise automatically
                  </span>
                  <Button
                    type="button"
                    onClick={handleAutoCategorize}
                    className="bg-[#768755] text-white hover:bg-[#5d6944]"
                  >
                    Auto-Categorise
                  </Button>
                </div>

                {/* dropdowns */}
                <div className="flex space-x-4">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                    className="flex-1 border rounded-md p-2 dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    <option value="">Category</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>

                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    required
                    className="flex-1 border rounded-md p-2 dark:bg-neutral-800 dark:border-neutral-700"
                  >
                    <option value="">Condition</option>
                    <option value="New">New</option>
                    <option value="Gently Used">Gently Used</option>
                    <option value="Worn">Worn</option>
                  </select>
                </div>

                {/* submit */}
                <Button
                  type="submit"
                  className="w-full bg-[#768755] text-white hover:bg-[#5d6944] py-3 text-base font-medium rounded-md transition"
                >
                  Submit Donation
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <h3 className="text-2xl font-semibold text-green-800 dark:text-emerald-400">
                  Thank you for your donation! 💚
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Your item <strong>{itemName}</strong> has been recorded under{" "}
                  <strong>{category}</strong> ({condition}).
                </p>
                {autoCategorized && (
                  <p className="text-sm text-gray-500 italic">
                    Categorised automatically using AI.
                  </p>
                )}

                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
                  <Button
                    onClick={handleReset}
                    className="bg-[#768755] text-white hover:bg-[#5d6944] px-6 py-2"
                  >
                    Make Another Donation
                  </Button>
                  <Button
                    onClick={() => setSubmitted(false)}
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 text-gray-800 dark:text-gray-100"
                  >
                    Edit Donation
                  </Button>
                </div>
              </div>
            )}
          </SignedIn>
        </section>
      </main>
    </>
  );
}
