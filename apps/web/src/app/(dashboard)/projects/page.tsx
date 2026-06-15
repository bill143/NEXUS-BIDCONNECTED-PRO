"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Search,
  Plus,
  FolderKanban,
  MoreHorizontal,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  BellOff,
  Copy,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  cn,
  Button,
  Input,
  Badge,
  Avatar,
  AvatarImage,  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@bidconnect/ui";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  type ColumnDef,
  flexRender,
} from "@tanstack/react-table";
import { useProjects, type ProjectFilters } from "@/hooks/use-projects";import type { Project } from "@bidconnect/types";
import { formatCurrency } from "@bidconnect/utils/currency";
import { formatDateTimeTz, getDeadlineCountdown } from "@bidconnect/utils/date";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────

type Tab = "active" | "closed" | "bidder-templates" | "bid-form-templates";
type Scope = "my-projects" | "my-office" | "my-company";

const TAB_TO_STATUS: Record<Tab, string | undefined> = {
  active: "ACTIVE",
  closed: "CLOSED",
  "bidder-templates": undefined,
  "bid-form-templates": undefined,
};

// ─────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────

function getInitials(firstName?: string, lastName?: string): string {
  return `${(firstName ?? "")[0] ?? ""}${(lastName ?? "")[0] ?? ""}`.toUpperCase();
}
function deadlineClasses(urgency: string): string {
  switch (urgency) {
    case "critical":
      return "text-red-400";
    case "warning":
      return "text-amber-400";
    case "past":
      return "text-red-500 line-through";
    default:
      return "text-slate-400";
  }
}

// ─────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────

const columns: ColumnDef<Project>[] = [
  {
    accessorKey: "number",
    header: "Number",
    size: 80,
    cell: ({ row }) => {
      const project = row.original;      return (
        <Link
          href={`/projects/${project.id}/bid-management`}
          className="font-mono text-xs text-sky-400 hover:text-sky-300 hover:underline"
        >
          {project.number ?? "--"}
        </Link>
      );
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    size: undefined,
    cell: ({ row }) => {
      const project = row.original;
      return (
        <div className="flex items-center gap-2 min-w-0">
          <Link
            href={`/projects/${project.id}/bid-management`}
            className="truncate font-medium text-slate-200 hover:text-sky-400 transition-colors"
          >
            {project.name}
          </Link>          {project.visibility === "INVITE_ONLY" && (
            <Badge variant="outline" className="shrink-0 border-sky-500/30 text-sky-400 text-[10px] px-1.5 py-0">
              Invited
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "bidsdueat",
    header: "Bids Due",
    size: 180,
    cell: ({ row }) => {
      const project = row.original;
      if (!project.bidsdueat) return <span className="text-slate-600">--</span>;
      const countdown = getDeadlineCountdown(project.bidsdueat);
      return (
        <div className="space-y-0.5">
          <div className="text-xs text-slate-300">
            {formatDateTimeTz(project.bidsdueat, project.bidsDueTimezone)}
          </div>
          <div className={cn("text-[10px]", deadlineClasses(countdown.urgency))}>
            {countdown.text}          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "clientName",
    header: "Client",
    size: 140,
    cell: ({ row }) => (
      <span className="text-sm text-slate-400 truncate">
        {row.original.clientName ?? "--"}
      </span>
    ),
  },
  {
    accessorKey: "dueToClientAt",
    header: "Due to Client",
    size: 180,
    cell: ({ row }) => {
      const project = row.original;
      if (!project.dueToClientAt)
        return <span className="text-slate-600">--</span>;
      return (
        <span className="text-xs text-slate-400">          {formatDateTimeTz(project.dueToClientAt, project.bidsDueTimezone)}
        </span>
      );
    },
  },
  {
    accessorKey: "estimatedValue",
    header: () => <div className="text-right">Value</div>,
    size: 120,
    cell: ({ row }) => (
      <div className="text-right text-sm tabular-nums text-slate-300">
        {formatCurrency(row.original.estimatedValue)}
      </div>
    ),
  },
  {
    accessorKey: "lead",
    header: "Lead",
    size: 200,
    enableSorting: false,
    cell: ({ row }) => {
      const lead = row.original.lead;
      if (!lead)
        return <span className="text-slate-600">Unassigned</span>;
      return (        <div className="flex items-center gap-2.5">
          <Avatar className="h-7 w-7">
            {lead.avatarUrl && <AvatarImage src={lead.avatarUrl} alt={`${lead.firstName} ${lead.lastName}`} />}
            <AvatarFallback className="bg-slate-700 text-[10px] text-slate-300">
              {getInitials(lead.firstName, lead.lastName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm text-slate-300">
              {lead.firstName} {lead.lastName}
            </div>
            {lead.title && (
              <div className="truncate text-[10px] text-slate-500">{lead.title}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    size: 60,
    enableSorting: false,
    cell: ({ row }) => {
      const project = row.original;      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Row actions</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 bg-slate-800 border-slate-700"
          >
            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2">
              <BellOff className="h-4 w-4" />
              Mute Notifications
            </DropdownMenuItem>
            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2">
              <XCircle className="h-4 w-4" />
              Close
            </DropdownMenuItem>            <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2">
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

// ─────────────────────────────────────────
// Skeleton Rows
// ─────────────────────────────────────────

function SkeletonRows({ count = 8 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <TableRow key={i} className="border-slate-800/60">
          <TableCell><Skeleton className="h-4 w-14 bg-slate-800" /></TableCell>
          <TableCell><Skeleton className="h-4 w-48 bg-slate-800" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32 bg-slate-800" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24 bg-slate-800" /></TableCell>          <TableCell><Skeleton className="h-4 w-32 bg-slate-800" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20 bg-slate-800 ml-auto" /></TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-7 rounded-full bg-slate-800" />
              <Skeleton className="h-4 w-24 bg-slate-800" />
            </div>
          </TableCell>
          <TableCell><Skeleton className="h-8 w-8 rounded bg-slate-800" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

// ─────────────────────────────────────────
// Empty State
// ─────────────────────────────────────────

function EmptyState({ tab }: { tab: Tab }) {
  const content: Record<Tab, { title: string; description: string; cta: string }> = {
    active: {
      title: "No active projects",
      description:        "Create your first project to start managing bids and inviting subcontractors.",
      cta: "Create Project",
    },
    closed: {
      title: "No closed projects",
      description:
        "Projects that have been completed or archived will appear here.",
      cta: "View Active Projects",
    },
    "bidder-templates": {
      title: "No bidder list templates",
      description:
        "Save frequently used bidder lists as templates for quick project setup.",
      cta: "Create Template",
    },
    "bid-form-templates": {
      title: "No bid form templates",
      description:
        "Create reusable bid form templates to standardize your bid process.",
      cta: "Create Template",
    },
  };

  const c = content[tab];

  return (    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800">
        <FolderKanban className="h-7 w-7 text-slate-500" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-slate-300">{c.title}</h3>
      <p className="mt-2 max-w-sm text-center text-sm text-slate-600">
        {c.description}
      </p>
      <Link href="/projects/new">
        <Button className="mt-6 bg-sky-600 hover:bg-sky-500 text-white gap-2">
          <Plus className="h-4 w-4" />
          {c.cta}
        </Button>
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export default function ProjectsPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<Tab>("active");  const [scope, setScope] = useState<Scope>("my-projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "bidsdueat", desc: false },
  ]);

  const filters: ProjectFilters = useMemo(
    () => ({
      status: TAB_TO_STATUS[activeTab],
      scope,
      search: searchQuery || undefined,
      page,
      limit: 25,
      sort: sorting[0]?.id ?? "bidsdueat",
      order: sorting[0]?.desc ? "desc" : "asc",
    }),
    [activeTab, scope, searchQuery, page, sorting]
  );

  const { data, isLoading } = useProjects(filters);
  const projects = data?.projects ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / 25);
  const table = useReactTable({
    data: projects,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
  });

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as Tab);
    setPage(1);
  }, []);

  const showTable = activeTab === "active" || activeTab === "closed";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100">
            Projects          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your construction bids and project pipeline
          </p>
        </div>
        <Link href="/projects/new">
          <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </Link>
      </div>

      {/* Tab bar */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="bg-transparent border-b border-slate-800 rounded-none w-full justify-start gap-1 p-0">
          <TabsTrigger
            value="active"
            className="relative rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-slate-300"
          >
            Active Projects
          </TabsTrigger>
          <TabsTrigger
            value="closed"
            className="relative rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-slate-300"          >
            Closed Projects
          </TabsTrigger>
          <TabsTrigger
            value="bidder-templates"
            className="relative rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-slate-300"
          >
            Bidder List Templates
          </TabsTrigger>
          <TabsTrigger
            value="bid-form-templates"
            className="relative rounded-none border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 data-[state=active]:border-sky-500 data-[state=active]:text-sky-400 data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-slate-300"
          >
            Bid Form Templates
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px] max-w-sm">          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search projects..."
            className="h-9 pl-9 bg-slate-800/50 border-slate-800 text-slate-200 placeholder:text-slate-500 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
          />
        </div>

        {/* Scope toggle */}
        <div className="inline-flex rounded-lg border border-slate-800 bg-slate-900 p-0.5">
          {(["my-projects", "my-office", "my-company"] as const).map((s) => (
            <button
              key={s}
              onClick={() => {
                setScope(s);
                setPage(1);
              }}
              className={cn(                "rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                scope === s
                  ? "bg-slate-800 text-slate-200 shadow-sm"
                  : "text-slate-500 hover:text-slate-400"
              )}
            >
              {s === "my-projects"
                ? "My Projects"
                : s === "my-office"
                  ? "My Office"
                  : "My Company"}
            </button>
          ))}
        </div>

        {/* New Project on small screens */}
        <Link href="/projects/new" className="ml-auto sm:hidden">
          <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            New
          </Button>
        </Link>
      </div>

      {/* Content */}
      {showTable ? (        <>
          {/* Data table */}
          <div className="rounded-lg border border-slate-800 overflow-hidden">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow
                    key={headerGroup.id}
                    className="border-slate-800 bg-slate-900/60 hover:bg-slate-900/60"
                  >
                    {headerGroup.headers.map((header) => {
                      const canSort = header.column.getCanSort();
                      const sorted = header.column.getIsSorted();
                      return (
                        <TableHead
                          key={header.id}
                          style={{ width: header.getSize() !== 150 ? header.getSize() : undefined }}
                          className={cn(
                            "text-xs font-medium text-slate-500 uppercase tracking-wider",
                            canSort && "cursor-pointer select-none hover:text-slate-300"
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          <div className="flex items-center gap-1.5">                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {canSort && (
                              <span className="text-slate-600">
                                {sorted === "asc" ? (
                                  <ArrowUp className="h-3.5 w-3.5 text-sky-400" />
                                ) : sorted === "desc" ? (
                                  <ArrowDown className="h-3.5 w-3.5 text-sky-400" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3" />
                                )}
                              </span>
                            )}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <SkeletonRows />                ) : projects.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-60 text-center"
                    >
                      <EmptyState tab={activeTab} />
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="border-slate-800/60 transition-colors hover:bg-slate-800/50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-1">
              <p className="text-sm text-slate-500">
                Showing {(page - 1) * 25 + 1}
                {" - "}
                {Math.min(page * 25, total)} of {total} projects
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 disabled:opacity-40 gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-sm text-slate-400 tabular-nums">                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="border-slate-700 bg-slate-800/50 text-slate-300 hover:bg-slate-800 disabled:opacity-40 gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      ) : (
        <EmptyState tab={activeTab} />
      )}
    </div>
  );
}