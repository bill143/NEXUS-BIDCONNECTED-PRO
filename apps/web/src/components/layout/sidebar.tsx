"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderKanban,
  ClipboardList,
  CalendarDays,
  ShieldCheck,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  Clock,
  ChevronLeft,
  ChevronDown,
  ChevronRight,
  Building2,
} from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@bidconnect/ui/lib/utils";

interface NavItem {
  label: string;  href: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Bid Board", href: "/bid-board", icon: ClipboardList },
  { label: "Calendar", href: "/calendar", icon: CalendarDays },
  { label: "Qualifications", href: "/qualifications", icon: ShieldCheck },
  { label: "Contacts", href: "/contacts", icon: Users },
  { label: "Analytics", href: "/analytics", icon: BarChart3 },
];

const bottomNavItems: NavItem[] = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const pathname = usePathname();
  const {
    isCollapsed,
    toggle,
    recentlyViewed,
    isRecentlyViewedOpen,    toggleRecentlyViewed,
  } = useSidebarStore();

  const isActive = (href: string): boolean => {
    if (href === "/projects" && pathname === "/") return true;
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={toggle}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-slate-800/80 transition-all duration-300 ease-in-out",
          "glass-panel",
          "bg-slate-950/90",
          isCollapsed ? "w-[72px]" : "w-[280px]",          "max-lg:translate-x-0",
          isCollapsed && "max-lg:-translate-x-full"
        )}
      >
        {/* Logo section */}
        <div className="flex h-14 items-center border-b border-slate-800/60 px-4">
          <Link href="/projects" className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-500 shadow-lg shadow-sky-500/20">
              <Building2 className="h-4.5 w-4.5 text-white" />
            </div>
            {!isCollapsed && (
              <div className="animate-fade-in overflow-hidden">
                <h1 className="text-sm font-bold tracking-tight text-slate-100">
                  BidConnect Pro
                </h1>
                <p className="truncate text-[10px] font-medium text-slate-500">
                  O&apos;Neill Contractors
                </p>
              </div>
            )}
          </Link>

          {!isCollapsed && (
            <button
              onClick={toggle}              className="ml-auto flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 scrollbar-dark">
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "nav-item group relative",
                      active && "nav-item-active",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-sky-500" />
                    )}
                    <Icon
                      className={cn(
                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="animate-fade-in truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Separator */}
          {!isCollapsed && (
            <div className="my-4 border-t border-slate-800/60" />
          )}
          {isCollapsed && <div className="my-4" />}
          {/* Recently Viewed */}
          {!isCollapsed && (
            <div className="animate-fade-in">
              <button
                onClick={toggleRecentlyViewed}
                className="mb-1 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500 transition-colors hover:text-slate-400"
              >
                <Clock className="h-3.5 w-3.5" />
                <span>Recently Viewed</span>
                {isRecentlyViewedOpen ? (
                  <ChevronDown className="ml-auto h-3.5 w-3.5" />
                ) : (
                  <ChevronRight className="ml-auto h-3.5 w-3.5" />
                )}
              </button>

              {isRecentlyViewedOpen && (
                <ul className="animate-slide-in-top space-y-0.5 pl-1">
                  {recentlyViewed.length === 0 ? (
                    <li className="px-3 py-2 text-xs text-slate-600">
                      No recent items
                    </li>
                  ) : (                    recentlyViewed.map((item) => (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-slate-500 transition-colors hover:bg-slate-800/60 hover:text-slate-300"
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-600" />
                          <span className="truncate">{item.name}</span>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          )}

          {isCollapsed && (
            <div className="flex justify-center">
              <button
                className="nav-item justify-center px-0"
                title="Recently Viewed"
                onClick={toggle}
              >                <Clock className="h-[18px] w-[18px] text-slate-500" />
              </button>
            </div>
          )}
        </nav>

        {/* Bottom pinned items */}
        <div className="border-t border-slate-800/60 px-3 py-3">
          <ul className="space-y-1">
            {bottomNavItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "nav-item group",
                      active && "nav-item-active",
                      isCollapsed && "justify-center px-0"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(                        "h-[18px] w-[18px] shrink-0",
                        active ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="animate-fade-in truncate">
                        {item.label}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </>
  );
}