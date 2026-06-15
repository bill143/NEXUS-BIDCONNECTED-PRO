"use client";

import { useState } from "react";
import { Users, UserPlus, Building2 } from "lucide-react";
import { cn, Button, Tabs, TabsList, TabsTrigger } from "@bidconnect/ui";

type ContactTab = "team" | "external";

export default function ContactsPage() {
  const [tab, setTab] = useState<ContactTab>("team");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-100">Contacts</h2>
        <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2">
          <UserPlus className="h-4 w-4" />
          Add Contact
        </Button>
      </div>

      {/* Split view tabs */}
      <Tabs value={tab} onValueChange={(v) => setTab(v as ContactTab)}>
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger
            value="team"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400 gap-2"
          >            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger
            value="external"
            className="data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 text-slate-400 gap-2"
          >
            <Building2 className="h-4 w-4" />
            External Contacts
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
          {tab === "team" ? (
            <Users className="h-7 w-7 text-slate-500" />
          ) : (
            <Building2 className="h-7 w-7 text-slate-500" />
          )}
        </div>
        <h3 className="mt-5 text-base font-semibold text-slate-300">
          {tab === "team"
            ? "No team members added"
            : "No external contacts"}
        </h3>        <p className="mt-2 max-w-md text-center text-sm text-slate-600">
          {tab === "team"
            ? "Add internal team members to collaborate on this project. They will have access based on their assigned role."
            : "External contacts such as architects, engineers, and consultants associated with this project will appear here."}
        </p>
        <Button className="mt-6 bg-sky-600 hover:bg-sky-500 text-white gap-2">
          <UserPlus className="h-4 w-4" />
          {tab === "team" ? "Add Team Member" : "Add Contact"}
        </Button>
      </div>
    </div>
  );
}
