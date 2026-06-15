"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Shield,
  Bell,
  AlertTriangle,
  XCircle,
  Archive,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  cn,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Label,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@bidconnect/ui";
import { useProject, useUpdateProject, useDeleteProject } from "@/hooks/use-projects";
// ─────────────────────────────────────────
// Visibility Options
// ─────────────────────────────────────────

const VISIBILITY_OPTIONS = [
  {
    value: "PUBLIC",
    label: "Public",
    description:
      "Anyone in your organization can find and view this project. External users still need an invitation.",
  },
  {
    value: "PRIVATE",
    label: "Private",
    description:
      "Only assigned team members can see this project in their list. Subcontractors with invitations can still view bid packages.",
  },
  {
    value: "INVITE_ONLY",
    label: "Invite Only",
    description:
      "Only explicitly invited team members and subcontractors can access this project and its documents.",
  },
];

// ─────────────────────────────────────────
// Confirmation Dialog
// ─────────────────────────────────────────
function ConfirmDialog({
  title,
  description,
  confirmLabel,
  confirmVariant = "destructive",
  isPending,
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  confirmVariant?: "destructive" | "default";
  isPending?: boolean;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="bg-slate-800 border-slate-700 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-slate-100">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {description}
          </DialogDescription>
        </DialogHeader>        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-700"
          >
            Cancel
          </Button>
          <Button
            variant={confirmVariant === "destructive" ? "destructive" : "default"}
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
            disabled={isPending}
            className={cn(
              confirmVariant === "destructive"
                ? "bg-red-600 hover:bg-red-500 text-white"
                : "bg-sky-600 hover:bg-sky-500 text-white"
            )}
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────
export default function SettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { data: projectResponse } = useProject(projectId);
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const project = (projectResponse as any)?.data ?? projectResponse;
  const currentVisibility = project?.visibility ?? "PRIVATE";
  const isMuted = project?.isMuted ?? false;

  function handleVisibilityChange(value: string) {
    updateProject.mutate({
      id: projectId,
      visibility: value,
    } as any);
  }

  function handleToggleMute() {
    updateProject.mutate({
      id: projectId,
      isMuted: !isMuted,
    } as any);
  }

  function handleClose() {
    updateProject.mutate({
      id: projectId,
      status: "CLOSED",
    } as any);
  }
  function handleArchive() {
    updateProject.mutate({
      id: projectId,
      status: "ARCHIVED",
    } as any);
  }

  function handleDelete() {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        router.push("/projects");
      },
    });
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-slate-100">
        Project Settings
      </h2>

      {/* Visibility */}
      <Card className="bg-slate-800/40 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <Shield className="h-4 w-4 text-sky-400" />
            Visibility
          </CardTitle>
          <CardDescription className="text-slate-500">
            Control who can see and access this project.
          </CardDescription>
        </CardHeader>        <CardContent>
          <div className="space-y-3">
            {VISIBILITY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
                  currentVisibility === opt.value
                    ? "border-sky-500/50 bg-sky-500/5"
                    : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                )}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={opt.value}
                  checked={currentVisibility === opt.value}
                  onChange={() => handleVisibilityChange(opt.value)}
                  className="mt-0.5 accent-sky-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {opt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500 leading-relaxed">
                    {opt.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>
      {/* Notifications */}
      <Card className="bg-slate-800/40 border-slate-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-200 flex items-center gap-2">
            <Bell className="h-4 w-4 text-sky-400" />
            Notifications
          </CardTitle>
          <CardDescription className="text-slate-500">
            Manage notification preferences for this project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Mute Notifications
              </p>
              <p className="text-xs text-slate-500">
                When muted, you will not receive push or email notifications for
                this project.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isMuted}
              onClick={handleToggleMute}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                isMuted ? "bg-sky-500" : "bg-slate-700"
              )}
            >              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform",
                  isMuted ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-500/30 bg-slate-800/40">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-slate-500">
            These actions are irreversible. Proceed with caution.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Close */}
          <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Close Project
              </p>
              <p className="text-xs text-slate-500">
                Mark this project as closed. No new bids will be accepted.
              </p>
            </div>            <ConfirmDialog
              title="Close Project"
              description="Are you sure you want to close this project? Subcontractors will no longer be able to submit bids. You can reopen it later."
              confirmLabel="Close Project"
              isPending={updateProject.isPending}
              onConfirm={handleClose}
            >
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 gap-2"
              >
                <XCircle className="h-4 w-4" />
                Close
              </Button>
            </ConfirmDialog>
          </div>

          {/* Archive */}
          <div className="flex items-center justify-between rounded-lg border border-slate-700 p-4">
            <div>
              <p className="text-sm font-medium text-slate-200">
                Archive Project
              </p>
              <p className="text-xs text-slate-500">
                Archive this project. It will be hidden from active views but
                retained for records.
              </p>
            </div>            <ConfirmDialog
              title="Archive Project"
              description="Are you sure you want to archive this project? It will no longer appear in active project lists."
              confirmLabel="Archive"
              isPending={updateProject.isPending}
              onConfirm={handleArchive}
            >
              <Button
                variant="outline"
                size="sm"
                className="border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-slate-100 gap-2"
              >
                <Archive className="h-4 w-4" />
                Archive
              </Button>
            </ConfirmDialog>
          </div>

          {/* Delete */}
          <div className="flex items-center justify-between rounded-lg border border-red-500/20 bg-red-500/5 p-4">
            <div>
              <p className="text-sm font-medium text-red-400">
                Delete Project
              </p>
              <p className="text-xs text-slate-500">
                Permanently delete this project and all associated data. This
                action cannot be undone.
              </p>
            </div>            <ConfirmDialog
              title="Delete Project"
              description="This will permanently delete the project, all bid packages, invitations, documents, and activity history. This action cannot be undone."
              confirmLabel="Delete Permanently"
              isPending={deleteProject.isPending}
              onConfirm={handleDelete}
            >
              <Button
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-500 text-white gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            </ConfirmDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
