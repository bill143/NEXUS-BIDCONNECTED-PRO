"use client";

import { Users, UserPlus } from "lucide-react";
import { Button } from "@bidconnect/ui";

export default function BidderListPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Bidder List</h2>
        <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2">
          <UserPlus className="h-4 w-4" />
          Add Bidders
        </Button>
      </div>

      {/* Empty State -- Sprint 3 */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
          <Users className="h-7 w-7 text-slate-500" />
        </div>
        <h3 className="mt-5 text-base font-semibold text-slate-300">
          No bidders added yet
        </h3>        <p className="mt-2 max-w-md text-center text-sm text-slate-600">
          Add subcontractors to your bidder list. You can invite them to submit
          bids on specific packages or import from a saved template.
        </p>
        <Button className="mt-6 bg-sky-600 hover:bg-sky-500 text-white gap-2">
          <UserPlus className="h-4 w-4" />
          Add Subcontractors
        </Button>
      </div>
    </div>
  );
}
