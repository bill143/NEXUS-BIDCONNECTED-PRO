"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Save,
  Loader2,
  MapPin,
  CalendarDays,
  X,
  UserCircle,
} from "lucide-react";
import {
  cn,
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Skeleton,
} from "@bidconnect/ui";import { useProject, useUpdateProject } from "@/hooks/use-projects";
import { CSI_DIVISIONS, formatCsiDivision } from "@bidconnect/utils/csi";
import { US_STATES } from "@bidconnect/utils/timezones";
import type { ProjectType, ProjectVisibility, ProjectStatus } from "@bidconnect/types";

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const overviewSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  number: z.string().optional(),
  projectType: z.string(),
  status: z.string(),
  estimatedValue: z.string().optional(),
  clientName: z.string().optional(),
  description: z.string().optional(),
  csiDivisions: z.array(z.string()),
  tags: z.array(z.string()),
  visibility: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  bidsdueat: z.string().optional(),
  dueToClientAt: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
});

type OverviewFormData = z.infer<typeof overviewSchema>;
const PROJECT_TYPES: { value: string; label: string }[] = [
  { value: "GENERAL_CONTRACTING", label: "General Contracting" },
  { value: "CM_AT_RISK", label: "CM at Risk" },
  { value: "DESIGN_BUILD", label: "Design-Build" },
  { value: "OWNER_CONTROLLED", label: "Owner Controlled" },
  { value: "OTHER", label: "Other" },
];

const STATUS_OPTIONS: { value: string; label: string; color: string }[] = [
  { value: "DRAFT", label: "Draft", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  { value: "ACTIVE", label: "Active", color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  { value: "CLOSED", label: "Closed", color: "bg-slate-500/10 text-slate-400 border-slate-500/20" },
  { value: "ARCHIVED", label: "Archived", color: "bg-slate-600/10 text-slate-500 border-slate-600/20" },
];

const VISIBILITY_OPTIONS: { value: string; label: string; desc: string }[] = [
  { value: "PUBLIC", label: "Public", desc: "Visible to anyone in your organization" },
  { value: "PRIVATE", label: "Private", desc: "Only team members can see this project" },
  { value: "INVITE_ONLY", label: "Invite Only", desc: "Only invited subcontractors can access" },
];

// ─────────────────────────────────────────
// Loading state
// ─────────────────────────────────────────

function OverviewSkeleton() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-3 space-y-4">        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-24 bg-slate-700" />
            <Skeleton className="h-10 w-full bg-slate-800" />
          </div>
        ))}
      </div>
      <div className="xl:col-span-2 space-y-4">
        <Card className="bg-slate-800/40 border-slate-700">
          <CardContent className="pt-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full bg-slate-700" />
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export default function OverviewPage() {
  const params = useParams();
  const projectId = params.id as string;
  const { data: projectResponse, isLoading } = useProject(projectId);
  const updateProject = useUpdateProject();
  const [tagInput, setTagInput] = useState("");
  // Extract project data from response wrapper
  const project = (projectResponse as any)?.data ?? projectResponse;

  const form = useForm<OverviewFormData>({
    resolver: zodResolver(overviewSchema),
    values: project
      ? {
          name: project.name ?? "",
          number: project.number ?? "",
          projectType: project.projectType ?? "GENERAL_CONTRACTING",
          status: project.status ?? "DRAFT",
          estimatedValue: project.estimatedValue ?? "",
          clientName: project.clientName ?? "",
          description: project.description ?? "",
          csiDivisions: project.csiDivisions ?? [],
          tags: project.tags ?? [],
          visibility: project.visibility ?? "PRIVATE",
          startDate: project.startDate?.split("T")[0] ?? "",
          endDate: project.endDate?.split("T")[0] ?? "",
          bidsdueat: project.bidsdueat?.slice(0, 16) ?? "",
          dueToClientAt: project.dueToClientAt?.slice(0, 16) ?? "",
          addressLine1: project.addressLine1 ?? "",
          city: project.city ?? "",
          state: project.state ?? "",
          zip: project.zip ?? "",
        }
      : undefined,
  });
  const { register, setValue, watch, formState: { errors, isDirty } } = form;
  const csiDivisions = watch("csiDivisions") ?? [];
  const tags = watch("tags") ?? [];
  const visibility = watch("visibility");
  const projectType = watch("projectType");
  const status = watch("status");
  const stateVal = watch("state");

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed], { shouldDirty: true });
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setValue("tags", tags.filter((t) => t !== tag), { shouldDirty: true });
  }

  function toggleCsi(code: string) {
    const next = csiDivisions.includes(code)
      ? csiDivisions.filter((c) => c !== code)
      : [...csiDivisions, code];
    setValue("csiDivisions", next, { shouldDirty: true });
  }

  async function handleSave() {
    const valid = await form.trigger();
    if (!valid) return;    const values = form.getValues();
    updateProject.mutate({
      id: projectId,
      ...values,
      bidsdueat: values.bidsdueat ? new Date(values.bidsdueat).toISOString() : undefined,
      dueToClientAt: values.dueToClientAt ? new Date(values.dueToClientAt).toISOString() : undefined,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
      estimatedValue: values.estimatedValue ? Number(values.estimatedValue) : undefined,
    } as any);
  }

  if (isLoading) return <OverviewSkeleton />;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Left Column -- Editable fields */}
        <div className="xl:col-span-3 space-y-5">
          <div>
            <Label htmlFor="name" className="text-slate-300">
              Project Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              {...register("name")}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="number" className="text-slate-300">
                Project Number
              </Label>
              <Input
                id="number"
                {...register("number")}
                className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 font-mono focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
              />
            </div>
            <div>
              <Label className="text-slate-300">Project Type</Label>
              <Select
                value={projectType}
                onValueChange={(val) => setValue("projectType", val, { shouldDirty: true })}
              >
                <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {PROJECT_TYPES.map((t) => (
                    <SelectItem
                      key={t.value}
                      value={t.value}
                      className="text-slate-300 focus:bg-slate-700 focus:text-slate-100"
                    >
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-slate-300">Status</Label>
              <div className="mt-1.5">
                <Select
                  value={status}
                  onValueChange={(val) => setValue("status", val, { shouldDirty: true })}
                >
                  <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem
                        key={s.value}
                        value={s.value}
                        className="text-slate-300 focus:bg-slate-700 focus:text-slate-100"
                      >
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="estimatedValue" className="text-slate-300">
                Estimated Value
              </Label>              <div className="relative mt-1.5">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                  $
                </span>
                <Input
                  id="estimatedValue"
                  {...register("estimatedValue")}
                  className="pl-7 bg-slate-800/50 border-slate-700 text-slate-200 tabular-nums focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="clientName" className="text-slate-300">
              Client
            </Label>
            <Input
              id="clientName"
              {...register("clientName")}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-slate-300">
              Description
            </Label>
            <Textarea
              id="description"
              {...register("description")}
              rows={4}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 resize-none focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
            />
          </div>
          {/* CSI Divisions */}
          <div>
            <Label className="text-slate-300">CSI Divisions</Label>
            {csiDivisions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {csiDivisions.map((code) => (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="bg-sky-500/10 text-sky-400 border-sky-500/20 gap-1 pr-1"
                  >
                    Div {code}
                    <button
                      type="button"
                      onClick={() => toggleCsi(code)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-sky-500/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-2 max-h-32 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/30 scrollbar-dark">
              {CSI_DIVISIONS.map((d) => (
                <label
                  key={d.code}
                  className="flex cursor-pointer items-center gap-2.5 px-3 py-1.5 text-sm hover:bg-slate-700/50 transition-colors"
                >                  <input
                    type="checkbox"
                    checked={csiDivisions.includes(d.code)}
                    onChange={() => toggleCsi(d.code)}
                    className="accent-sky-500"
                  />
                  <span className="font-mono text-xs text-slate-500">{d.code}</span>
                  <span className="text-slate-300 text-xs">{d.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label className="text-slate-300">Tags</Label>
            <div className="mt-1.5 flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Add a tag..."
                className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
              />              <Button
                type="button"
                variant="outline"
                onClick={addTag}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 shrink-0"
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-700 text-slate-300 gap-1 pr-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
          {/* Visibility */}
          <div>
            <Label className="text-slate-300">Visibility</Label>
            <div className="mt-2 space-y-2">
              {VISIBILITY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    visibility === opt.value
                      ? "border-sky-500/50 bg-sky-500/5"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={opt.value}
                    checked={visibility === opt.value}
                    onChange={() => setValue("visibility", opt.value, { shouldDirty: true })}
                    className="mt-0.5 accent-sky-500"
                  />
                  <div>
                    <p className="text-sm font-medium text-slate-200">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        {/* Right Column */}
        <div className="xl:col-span-2 space-y-4">
          {/* Dates */}
          <Card className="bg-slate-800/40 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-sky-400" />
                Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="startDate" className="text-slate-400 text-xs">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200 [color-scheme:dark] focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                />
              </div>
              <div>
                <Label htmlFor="endDate" className="text-slate-400 text-xs">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200 [color-scheme:dark] focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                />
              </div>              <div>
                <Label htmlFor="bidsdueat" className="text-slate-400 text-xs">
                  Bids Due
                </Label>
                <Input
                  id="bidsdueat"
                  type="datetime-local"
                  {...register("bidsdueat")}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200 [color-scheme:dark] focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                />
              </div>
              <div>
                <Label htmlFor="dueToClientAt" className="text-slate-400 text-xs">
                  Due to Client
                </Label>
                <Input
                  id="dueToClientAt"
                  type="datetime-local"
                  {...register("dueToClientAt")}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200 [color-scheme:dark] focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="bg-slate-800/40 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-sky-400" />
                Location
              </CardTitle>
            </CardHeader>            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="addressLine1" className="text-slate-400 text-xs">
                  Street Address
                </Label>
                <Input
                  id="addressLine1"
                  {...register("addressLine1")}
                  className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="city" className="text-slate-400 text-xs">
                    City
                  </Label>
                  <Input
                    id="city"
                    {...register("city")}
                    className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                  />
                </div>
                <div>
                  <Label className="text-slate-400 text-xs">State</Label>
                  <Select
                    value={stateVal || ""}
                    onValueChange={(val) => setValue("state", val, { shouldDirty: true })}
                  >
                    <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200">
                      <SelectValue placeholder="--" />
                    </SelectTrigger>                    <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                      {US_STATES.map((s) => (
                        <SelectItem
                          key={s.code}
                          value={s.code}
                          className="text-slate-300 focus:bg-slate-700 focus:text-slate-100"
                        >
                          {s.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="zip" className="text-slate-400 text-xs">
                    ZIP
                  </Label>
                  <Input
                    id="zip"
                    {...register("zip")}
                    maxLength={10}
                    className="mt-1 bg-slate-800/50 border-slate-600 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lead */}
          <Card className="bg-slate-800/40 border-slate-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">                <UserCircle className="h-4 w-4 text-sky-400" />
                Project Lead
              </CardTitle>
            </CardHeader>
            <CardContent>
              {project?.lead ? (
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 text-sm font-medium">
                    {(project.lead.firstName?.[0] ?? "") +
                      (project.lead.lastName?.[0] ?? "")}
                  </div>
                  <div>
                    <p className="text-sm text-slate-200">
                      {project.lead.firstName} {project.lead.lastName}
                    </p>
                    {project.lead.title && (
                      <p className="text-xs text-slate-500">{project.lead.title}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No lead assigned</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button          onClick={handleSave}
          disabled={!isDirty || updateProject.isPending}
          className="bg-sky-600 hover:bg-sky-500 text-white gap-2 disabled:opacity-40"
        >
          {updateProject.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
