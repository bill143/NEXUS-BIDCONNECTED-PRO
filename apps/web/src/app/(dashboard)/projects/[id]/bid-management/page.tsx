"use client";

import { useParams } from "next/navigation";
import { Package, Plus } from "lucide-react";
import { Button } from "@bidconnect/ui";

export default function BidManagementPage() {
  const params = useParams();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Bid Packages</h2>
        <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Package
        </Button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
          <Package className="h-7 w-7 text-slate-500" />
        </div>
        <h3 className="mt-5 text-base font-semibold text-slate-300">
          No bid packages yet
        </h3>        <p className="mt-2 max-w-md text-center text-sm text-slate-600">
          Create your first bid package to start inviting subcontractors. Each
          package represents a scope of work you need bids for.
        </p>
        <Button className="mt-6 bg-sky-600 hover:bg-sky-500 text-white gap-2">
          <Plus className="h-4 w-4" />
          Create Bid Package
        </Button>
      </div>
    </div>
  );
}
