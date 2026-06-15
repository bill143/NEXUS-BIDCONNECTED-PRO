"use client";

import { useEffect, useState } from "react";
import { Menu, Search, Bell, Command } from "lucide-react";
import { useSidebarStore } from "@/stores/sidebar-store";
import { UserNav } from "./user-nav";
import { cn } from "@bidconnect/ui/lib/utils";

export function Header() {
  const { isCollapsed, toggle } = useSidebarStore();
  const [notificationCount] = useState(3);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsSearchFocused(true);
      }
      if (event.key === "Escape") {
        setIsSearchFocused(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-slate-800/60 px-4 transition-all duration-300",
        "bg-slate-950/80 backdrop-blur-xl backdrop-saturate-150",
        isCollapsed ? "lg:pl-[88px]" : "lg:pl-[296px]"
      )}
    >
      {/* Left: Menu toggle */}
      <button
        onClick={toggle}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Center: Global search */}
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-lg">          <button
            onClick={() => setIsSearchFocused(true)}
            className={cn(
              "flex h-9 w-full items-center gap-3 rounded-lg border border-slate-800 bg-slate-800/50 px-3 text-sm text-slate-500 transition-all",
              "hover:border-slate-700 hover:bg-slate-800",
              isSearchFocused && "border-sky-500/50 bg-slate-800 ring-1 ring-sky-500/20"
            )}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">
              Search projects, bids, contacts...
            </span>
            <kbd className="hidden items-center gap-0.5 rounded-md border border-slate-700 bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 sm:inline-flex">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notification bell */}
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-slate-200"          aria-label={`Notifications: ${notificationCount} unread`}
        >
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-sky-500 px-1 text-[10px] font-bold text-white shadow-lg shadow-sky-500/30">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </button>

        {/* Separator */}
        <div className="mx-1 h-6 w-px bg-slate-800" />

        {/* User menu */}
        <UserNav />
      </div>

      {/* Search modal overlay */}
      {isSearchFocused && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsSearchFocused(false)}
          />          <div className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 animate-fade-in-scale">
            <div className="rounded-xl border border-slate-700 bg-slate-900 shadow-2xl shadow-black/50">
              <div className="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
                <Search className="h-5 w-5 text-slate-500" />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search projects, bids, contacts..."
                  className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-500 outline-none"
                  onBlur={() => setIsSearchFocused(false)}
                />
                <kbd className="rounded-md border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-500">
                  ESC
                </kbd>
              </div>
              <div className="p-4 text-center text-sm text-slate-600">
                Start typing to search across your workspace
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  );
}