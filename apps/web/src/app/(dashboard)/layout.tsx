"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useSidebarStore } from "@/stores/sidebar-store";
import { cn } from "@bidconnect/ui/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, setCollapsed } = useSidebarStore();

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 1024) {
        setCollapsed(true);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed]);

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar />

      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300",
          isCollapsed ? "lg:ml-[72px]" : "lg:ml-[280px]"
        )}
      >
        <Header />

        <main className="flex-1 overflow-y-auto scrollbar-dark">
          <div className="mx-auto w-full max-w-[1600px] p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
