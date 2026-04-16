import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/bond-utils";
import { StatusBadge } from "@/components/status-badge";
import Link from "next/link";
import clsx from "clsx";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      bonds: {
        select: {
          id: true,
          type: true,
          status: true,
          bondAmount: true,
          expirationDate: true,
        },
      },
      _count: { select: { bonds: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Construction projects with associated bid securities
          </p>
        </div>
        <Link
          href="/projects/new"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          New Project
        </Link>
      </div>

      {projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const totalBondAmount = project.bonds.reduce(
              (sum, b) => sum + b.bondAmount,
              0
            );
            const activeBonds = project.bonds.filter((b) =>
              ["active", "issued", "expiring"].includes(b.status)
            ).length;
            const expiringBonds = project.bonds.filter(
              (b) => b.status === "expiring"
            ).length;

            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 group-hover:text-brand-600">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      #{project.projectNumber}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      project.status === "active"
                        ? "bg-green-100 text-green-700"
                        : project.status === "completed"
                        ? "bg-gray-100 text-gray-700"
                        : "bg-red-100 text-red-700"
                    )}
                  >
                    {project.status}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  <p>{project.owner}</p>
                  <p>{project.location}</p>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                  <div>
                    <p className="text-xs text-gray-400">Bonds</p>
                    <p className="text-sm font-medium text-gray-900">
                      {project._count.bonds}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Active</p>
                    <p className="text-sm font-medium text-green-600">
                      {activeBonds}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total</p>
                    <p className="text-sm font-medium text-gray-900">
                      {formatCurrency(totalBondAmount)}
                    </p>
                  </div>
                </div>

                {expiringBonds > 0 && (
                  <div className="mt-3 rounded-lg bg-yellow-50 p-2">
                    <p className="text-xs font-medium text-yellow-700">
                      {expiringBonds} bond{expiringBonds !== 1 ? "s" : ""} expiring soon
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white p-12 text-center">
          <p className="text-sm text-gray-500">No projects yet</p>
          <Link
            href="/projects/new"
            className="mt-3 inline-block text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Create your first project
          </Link>
        </div>
      )}
    </div>
  );
}
