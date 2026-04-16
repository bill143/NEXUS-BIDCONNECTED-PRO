"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BOND_STATUS_LABELS } from "@/lib/bond-utils";
import type { BondStatus } from "@/lib/bond-utils";
import clsx from "clsx";

export function BondTransitionForm({
  bondId,
  currentStatus,
  validTransitions,
}: {
  bondId: string;
  currentStatus: string;
  validTransitions: string[];
}) {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [newExpirationDate, setNewExpirationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTransition = async () => {
    if (!selectedStatus) return;

    if (selectedStatus === "renewed" && !newExpirationDate) {
      setError("New expiration date is required for renewal");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/bonds/${bondId}/transitions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toStatus: selectedStatus,
          reason: reason || undefined,
          newExpirationDate: newExpirationDate || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to transition bond");
      }

      setSelectedStatus(null);
      setReason("");
      setNewExpirationDate("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const transitionColors: Record<string, string> = {
    active: "bg-green-600 hover:bg-green-700",
    expiring: "bg-yellow-600 hover:bg-yellow-700",
    renewed: "bg-purple-600 hover:bg-purple-700",
    released: "bg-teal-600 hover:bg-teal-700",
    forfeited: "bg-red-600 hover:bg-red-700",
    expired: "bg-red-500 hover:bg-red-600",
    issued: "bg-blue-600 hover:bg-blue-700",
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Current status:{" "}
        <span className="font-medium text-gray-700">
          {BOND_STATUS_LABELS[currentStatus as BondStatus] || currentStatus}
        </span>
      </p>

      <div className="flex flex-wrap gap-2">
        {validTransitions.map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors",
              selectedStatus === status
                ? "ring-2 ring-offset-2 ring-brand-500"
                : "",
              transitionColors[status] || "bg-gray-600 hover:bg-gray-700"
            )}
          >
            {BOND_STATUS_LABELS[status as BondStatus] || status}
          </button>
        ))}
      </div>

      {selectedStatus && (
        <div className="space-y-3 rounded-lg border border-gray-200 p-4">
          <p className="text-sm font-medium text-gray-700">
            Transition to:{" "}
            {BOND_STATUS_LABELS[selectedStatus as BondStatus] || selectedStatus}
          </p>

          {selectedStatus === "renewed" && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Expiration Date *
              </label>
              <input
                type="date"
                value={newExpirationDate}
                onChange={(e) => setNewExpirationDate(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Reason / Notes
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              placeholder="Optional reason for this transition..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleTransition}
              disabled={loading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm Transition"}
            </button>
            <button
              onClick={() => {
                setSelectedStatus(null);
                setError(null);
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
