"use client";

import { useState, useEffect, useCallback } from "react";
import { PriorityBadge } from "@/components/status-badge";
import Link from "next/link";
import clsx from "clsx";

interface Reminder {
  id: string;
  type: string;
  title: string;
  message: string;
  dueDate: string;
  status: string;
  priority: string;
  bond: { bondNumber: string; type: string; status: string } | null;
  project: { name: string; projectNumber: string } | null;
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<"pending" | "acknowledged" | "dismissed">("pending");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchReminders = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/reminders?status=${filter}`);
    const data = await res.json();
    setReminders(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleAcknowledge = async (id: string) => {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "acknowledged" }),
    });
    fetchReminders();
  };

  const handleDismiss = async (id: string) => {
    await fetch("/api/reminders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "dismissed" }),
    });
    fetchReminders();
  };

  const handleProcessReminders = async () => {
    setProcessing(true);
    await fetch("/api/reminders/process", { method: "POST" });
    await fetchReminders();
    setProcessing(false);
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const isOverdue = (date: string) => new Date(date) < new Date();

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reminders</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bond expiration warnings and renewal reminders
          </p>
        </div>
        <button
          onClick={handleProcessReminders}
          disabled={processing}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          {processing ? "Processing..." : "Process Reminders"}
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-2">
        {(["pending", "acknowledged", "dismissed"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={clsx(
              "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              filter === status
                ? "bg-brand-100 text-brand-700"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">Loading reminders...</p>
        </div>
      ) : reminders.length > 0 ? (
        <div className="space-y-3">
          {reminders.map((reminder) => (
            <div
              key={reminder.id}
              className={clsx(
                "rounded-xl border bg-white p-4 transition-colors",
                isOverdue(reminder.dueDate) && reminder.status === "pending"
                  ? "border-red-200"
                  : "border-gray-200"
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900">
                      {reminder.title}
                    </h3>
                    <PriorityBadge priority={reminder.priority} />
                    {isOverdue(reminder.dueDate) &&
                      reminder.status === "pending" && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          Overdue
                        </span>
                      )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {reminder.message}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>Due: {formatDate(reminder.dueDate)}</span>
                    {reminder.bond && (
                      <Link
                        href={`/bonds`}
                        className="text-brand-600 hover:text-brand-700"
                      >
                        Bond: {reminder.bond.bondNumber}
                      </Link>
                    )}
                    {reminder.project && (
                      <span>Project: {reminder.project.name}</span>
                    )}
                  </div>
                </div>

                {reminder.status === "pending" && (
                  <div className="ml-4 flex gap-2">
                    <button
                      onClick={() => handleAcknowledge(reminder.id)}
                      className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100"
                    >
                      Acknowledge
                    </button>
                    <button
                      onClick={() => handleDismiss(reminder.id)}
                      className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">
            No {filter} reminders
          </p>
        </div>
      )}
    </div>
  );
}
