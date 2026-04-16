"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewProjectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    projectNumber: "",
    owner: "",
    location: "",
    bidDueDate: "",
    estimatedValue: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          estimatedValue: parseFloat(form.estimatedValue),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create project");
      }

      const project = await response.json();
      router.push(`/projects/${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link href="/projects" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Projects
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Project</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Number *
              </label>
              <input
                type="text"
                value={form.projectNumber}
                onChange={(e) => updateField("projectNumber", e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Owner / GC *
              </label>
              <input
                type="text"
                value={form.owner}
                onChange={(e) => updateField("owner", e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location *
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => updateField("location", e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bid Due Date *
              </label>
              <input
                type="date"
                value={form.bidDueDate}
                onChange={(e) => updateField("bidDueDate", e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Estimated Value ($) *
              </label>
              <input
                type="number"
                step="0.01"
                value={form.estimatedValue}
                onChange={(e) => updateField("estimatedValue", e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
          </button>
          <Link
            href="/projects"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
