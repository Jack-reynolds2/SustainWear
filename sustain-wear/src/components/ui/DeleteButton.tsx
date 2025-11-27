"use client";

import { deleteDonation } from "../../features/actions/donateCRUD";

export default function DeleteButton({ donationId }: { donationId: string }) {
    return (
        <form action={deleteDonation}>
            <input type="hidden" name="donationId" value={donationId} />

            <button
                className="text-red-600 underline text-sm cursor-pointer"
                onClick={(e) => {
                    if (!confirm("Are you sure you want to delete this donation?")) {
                        e.preventDefault(); // stop submission if cancelled
                    }
                }}
            >
                Delete
            </button>
        </form>
    );
}
