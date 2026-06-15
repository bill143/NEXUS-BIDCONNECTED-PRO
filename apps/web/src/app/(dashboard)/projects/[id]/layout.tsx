"use client";

import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Plus,
  MoreHorizontal,
  Clock,
  Package,
  Users,
  FileText,
  MessageSquare,
  Settings,
  LayoutDashboard,
  XCircle,
  Archive,
  Copy,
  UserPlus,
  BarChart3,
  Zap,
} from "lucide-react";
import {
  cn,
  Button,
  Badge,
  Card,
  CardHeader,  CardTitle,
  CardContent,
  Avatar,
  AvatarFallback,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  Separator,
  Skeleton,
} from "@bidconnect/ui";
import { useProject } from "@/hooks/use-projects";
import { getDeadlineCountdown, formatDateTimeTz } from "@bidconnect/utils/date";
import { formatPercent } from "@bidconnect/utils/currency";

// ─────────────────────────────────────────
// Tab navigation
// ─────────────────────────────────────────

const TABS = [
  { id: "bid-management", label: "Bid Management", icon: Package },
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "bidder-list", label: "Bidder List", icon: Users },
  { id: "contacts", label: "Contacts", icon: UserPlus },
  { id: "activity", label: "Activity", icon: MessageSquare },
  { id: "settings", label: "Settings", icon: Settings },
] as const;
function getActiveTab(pathname: string, projectId: string): string {
  const suffix = pathname.replace(`/projects/${projectId}`, "").replace(/^\//, "");
  return suffix || "bid-management";
}

function statusColor(status?: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "DRAFT":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "CLOSED":
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    case "ARCHIVED":
      return "bg-slate-600/10 text-slate-500 border-slate-600/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
}

function urgencyColor(urgency: string): string {
  switch (urgency) {
    case "critical":
      return "text-red-400";
    case "warning":
      return "text-amber-400";
    case "past":
      return "text-red-500";
    default:
      return "text-slate-400";
  }
}
// ─────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────

function ProjectSidebar({
  project,
  isLoading,
}: {
  project: any;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <aside className="hidden xl:block w-[300px] shrink-0 space-y-4">
        <Card className="bg-slate-800/40 border-slate-700">
          <CardHeader className="pb-3">
            <Skeleton className="h-5 w-28 bg-slate-700" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full bg-slate-700" />
            ))}
          </CardContent>
        </Card>
      </aside>
    );
  }
  const totalPackages = project?.bidPackages?.length ?? 0;
  const totalInvited = project?.bidPackages?.reduce(
    (acc: number, pkg: any) => acc + (pkg.invitedCount ?? 0),
    0
  ) ?? 0;
  const totalSubmitted = project?.bidPackages?.reduce(
    (acc: number, pkg: any) => acc + (pkg.submittedCount ?? 0),
    0
  ) ?? 0;
  const responseRate = totalInvited > 0 ? totalSubmitted / totalInvited : 0;

  const members = project?.members ?? [];

  return (
    <aside className="hidden xl:block w-[300px] shrink-0 space-y-4">
      {/* Stats */}
      <Card className="bg-slate-800/40 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-sky-400" />
            Project Stats
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Total Packages</span>
            <span className="text-sm font-medium text-slate-200 tabular-nums">
              {totalPackages}
            </span>
          </div>          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Invited</span>
            <span className="text-sm font-medium text-slate-200 tabular-nums">
              {totalInvited}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Submitted</span>
            <span className="text-sm font-medium text-slate-200 tabular-nums">
              {totalSubmitted}
            </span>
          </div>
          <Separator className="bg-slate-700" />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Response Rate</span>
            <span className="text-sm font-semibold text-sky-400 tabular-nums">
              {formatPercent(responseRate)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card className="bg-slate-800/40 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Users className="h-4 w-4 text-sky-400" />
            Team Members
          </CardTitle>
        </CardHeader>        <CardContent>
          {project?.lead && (
            <div className="flex items-center gap-2.5 py-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-sky-500/10 text-sky-400 text-[10px]">
                  {(project.lead.firstName?.[0] ?? "") +
                    (project.lead.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-200">
                  {project.lead.firstName} {project.lead.lastName}
                </p>
                <p className="text-[10px] text-sky-400">Lead</p>
              </div>
            </div>
          )}
          {members.map((m: any) => (
            <div key={m.id} className="flex items-center gap-2.5 py-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-slate-700 text-slate-300 text-[10px]">
                  {(m.user?.firstName?.[0] ?? "") +
                    (m.user?.lastName?.[0] ?? "")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm text-slate-300">
                  {m.user?.firstName} {m.user?.lastName}
                </p>                <p className="text-[10px] text-slate-500 capitalize">{m.role}</p>
              </div>
            </div>
          ))}
          {members.length === 0 && !project?.lead && (
            <p className="text-xs text-slate-500 py-2">No team members assigned.</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="bg-slate-800/40 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Zap className="h-4 w-4 text-sky-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-700 gap-2"
          >
            <Send className="h-3.5 w-3.5" />
            Send Invitations
          </Button>          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-700 gap-2"
          >
            <FileText className="h-3.5 w-3.5" />
            Upload Documents
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-700 gap-2"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Add Team Member
          </Button>
        </CardContent>
      </Card>
    </aside>
  );
}

// ─────────────────────────────────────────
// Layout
// ─────────────────────────────────────────

export default function ProjectDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {  const params = useParams();
  const pathname = usePathname();
  const projectId = params.id as string;
  const { data: project, isLoading } = useProject(projectId);
  const activeTab = getActiveTab(pathname, projectId);

  const deadline = project?.bidsdueat
    ? getDeadlineCountdown(project.bidsdueat)
    : null;

  return (
    <div className="animate-fade-in space-y-0">
      {/* Project Header */}
      <div className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <Link href="/projects">
              <Button
                variant="ghost"
                size="icon"
                className="mt-0.5 shrink-0 text-slate-400 hover:text-slate-200 hover:bg-slate-800 h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">                {isLoading ? (
                  <>
                    <Skeleton className="h-5 w-16 bg-slate-700 rounded" />
                    <Skeleton className="h-7 w-64 bg-slate-700 rounded" />
                  </>
                ) : (
                  <>
                    {project?.number && (
                      <Badge
                        variant="outline"
                        className="font-mono text-xs border-slate-600 text-slate-400"
                      >
                        {project.number}
                      </Badge>
                    )}
                    <h1 className="text-xl font-bold text-slate-100 truncate">
                      {project?.name ?? "Untitled Project"}
                    </h1>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", statusColor(project?.status))}
                    >
                      {project?.status ?? "DRAFT"}
                    </Badge>
                  </>
                )}
              </div>

              {!isLoading && (
                <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">                  {project?.clientName && (
                    <span>{project.clientName}</span>
                  )}
                  {project?.bidsdueat && deadline && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        Bids due{" "}
                        {formatDateTimeTz(
                          project.bidsdueat,
                          project.bidsDueTimezone
                        )}
                      </span>
                      <span className={cn("font-medium", urgencyColor(deadline.urgency))}>
                        ({deadline.text})
                      </span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2 hidden sm:flex">
              <Send className="h-4 w-4" />
              Send ITB
            </Button>            <Button
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800 gap-2 hidden sm:flex"
            >
              <Plus className="h-4 w-4" />
              Add Package
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-slate-700 text-slate-400 hover:bg-slate-800"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-slate-800 border-slate-700"
              >
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2 sm:hidden">
                  <Send className="h-4 w-4" />
                  Send ITB
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2 sm:hidden">
                  <Plus className="h-4 w-4" />
                  Add Package
                </DropdownMenuItem>                <DropdownMenuSeparator className="bg-slate-700 sm:hidden" />
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2">
                  <XCircle className="h-4 w-4" />
                  Close Project
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2">
                  <Archive className="h-4 w-4" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-700 focus:text-slate-100 gap-2">
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 -mx-6 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-6">
        <nav className="flex gap-0.5 overflow-x-auto scrollbar-none -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={`/projects/${projectId}/${tab.id}`}                className={cn(
                  "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                  isActive
                    ? "border-sky-500 text-sky-400"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:border-slate-600"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Content + Sidebar */}
      <div className="flex gap-6 pt-6">
        <div className="flex-1 min-w-0">{children}</div>
        <ProjectSidebar project={project} isLoading={isLoading} />
      </div>
    </div>
  );
}
