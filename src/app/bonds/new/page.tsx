"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  projectNumber: string;
}

export default function NewBondPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    bondNumber: "",
    type: "bid_bond",
    projectId: "",
    suretyCompany: "",
    principalName: "",
    obligeeName: "",
    bondAmount: "",
    premiumAmount: "",
    premiumRate: "",
    effectiveDate: "",
    expirationDate: "",
    underwriter: "",
    agentName: "",
    agentContact: "",
    notes: "",
  });

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then(setProjects);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/bonds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          bondAmount: parseFloat(form.bondAmount),
          premiumAmount: parseFloat(form.premiumAmount || "0"),
          premiumRate: form.premiumRate ? parseFloat(form.premiumRate) : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create bond");
      }

      const bond = await response.json();
      router.push(`/bonds/${bond.id}`);
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
        <Link href="/bonds" className="text-sm text-gray-500 hover:text-gray-700">
          ← Back to Bonds
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold text-gray-900">Create New Bond</h1>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Bond Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Bond Number *" value={form.bondNumber} onChange={(v) => updateField("bondNumber", v)} required />

            <div>
              <label className="block text-sm font-medium text-gray-700">Type *</label>
              <select
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="bid_bond">Bid Bond</option>
                <option value="performance_bond">Performance Bond</option>
                <option value="payment_bond">Payment Bond</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Project *</label>
              <select
                value={form.projectId}
                onChange={(e) => updateField("projectId", e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option value="">Select a project...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectNumber})
                  </option>
                ))}
              </select>
            </div>

            <FormField label="Surety Company *" value={form.suretyCompany} onChange={(v) => updateField("suretyCompany", v)} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Principal Name *" value={form.principalName} onChange={(v) => updateField("principalName", v)} required />
            <FormField label="Obligee Name *" value={form.obligeeName} onChange={(v) => updateField("obligeeName", v)} required />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Financial Details</h2>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Bond Amount ($) *" value={form.bondAmount} onChange={(v) => updateField("bondAmount", v)} type="number" required />
            <FormField label="Premium Amount ($)" value={form.premiumAmount} onChange={(v) => updateField("premiumAmount", v)} type="number" />
            <FormField label="Premium Rate (%)" value={form.premiumRate} onChange={(v) => updateField("premiumRate", v)} type="number" />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Dates</h2>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Effective Date *" value={form.effectiveDate} onChange={(v) => updateField("effectiveDate", v)} type="date" required />
            <FormField label="Expiration Date *" value={form.expirationDate} onChange={(v) => updateField("expirationDate", v)} type="date" required />
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Agent Information</h2>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Underwriter" value={form.underwriter} onChange={(v) => updateField("underwriter", v)} />
            <FormField label="Agent Name" value={form.agentName} onChange={(v) => updateField("agentName", v)} />
            <FormField label="Agent Contact" value={form.agentContact} onChange={(v) => updateField("agentContact", v)} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField("notes", e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
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
            {loading ? "Creating..." : "Create Bond"}
          </button>
          <Link
            href="/bonds"
            className="rounded-lg border border-gray-300 px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        step={type === "number" ? "0.01" : undefined}
        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
    </div>
  );
}
