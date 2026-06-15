"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  FolderKanban,
  ArrowUpDown,
  Filter,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@bidconnect/ui/lib/utils";

type Tab = "active" | "closed" | "bidder-templates" | "bid-form-templates";
type Scope = "my-projects" | "my-office" | "my-company";

const tabs: { id: Tab; label: string }[] = [
  { id: "active", label: "Active Projects" },
  { id: "closed", label: "Closed Projects" },
  { id: "bidder-templates", label: "Bidder List Templates" },
  { id: "bid-form-templates", label: "Bid Form Templates" },
];

const scopes: { id: Scope; label: string }[] = [
  { id: "my-projects", label: "My Projects" },
  { id: "my-office", label: "My Office" },
  { id: "my-company", label: "My Company" },
];

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("active");
  const [activeScope, setActiveScope] = useState<Scope>("my-projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your construction bids and project pipeline
          </p>
        </div>
        <button className="btn-primary">
          <Plus className="h-4 w-4" />
          New Project
        </button>
      </div>

      {/* Tab bar */}
      <div className="border-b border-slate-800">
        <nav className="-mb-px flex gap-1" aria-label="Project tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "text-sky-400"
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-sky-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="h-9 w-full rounded-lg border border-slate-800 bg-slate-800/50 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20"
          />
        </div>

        {/* Scope toggle */}
        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
          {scopes.map((scope) => (
            <button
              key={scope.id}
              onClick={() => setActiveScope(scope.id)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeScope === scope.id
                  ? "bg-slate-800 text-slate-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-400"
              )}
            >
              {scope.label}
            </button>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <button className="toolbar-button">
            <Filter className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Filter</span>
          </button>

          <button className="toolbar-button">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort</span>
          </button>

          <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md p-1.5 transition-all",
                viewMode === "list"
                  ? "bg-slate-800 text-slate-200"
                  : "text-slate-500 hover:text-slate-400"
              )}
              aria-label="List view"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md p-1.5 transition-all",
                viewMode === "grid"
                  ? "bg-slate-800 text-slate-200"
                  : "text-slate-500 hover:text-slate-400"
              )}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 py-20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
          <FolderKanban className="h-7 w-7 text-slate-500" />
        </div>
        <h3 className="mt-5 text-base font-semibold text-slate-300">
          {activeTab === "active" && "No active projects"}
          {activeTab === "closed" && "No closed projects"}
          {activeTab === "bidder-templates" && "No bidder list templates"}
          {activeTab === "bid-form-templates" && "No bid form templates"}
        </h3>
        <p className="mt-2 max-w-sm text-center text-sm text-slate-600">
          {activeTab === "active" &&
            "Create your first project to start managing bids and inviting subcontractors."}
          {activeTab === "closed" &&
            "Projects that have been completed or archived will appear here."}
          {activeTab === "bidder-templates" &&
            "Save frequently used bidder lists as templates for quick project setup."}
          {activeTab === "bid-form-templates" &&
            "Create reusable bid form templates to standardize your bid process."}
        </p>
        <button className="btn-primary mt-6">
          <Plus className="h-4 w-4" />
          {activeTab === "active" && "Create Project"}
          {activeTab === "closed" && "View Active Projects"}
          {activeTab === "bidder-templates" && "Create Template"}
          {activeTab === "bid-form-templates" && "Create Template"}
        </button>
      </div>
    </div>
  );
}
