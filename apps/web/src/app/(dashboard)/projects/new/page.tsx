"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  CalendarDays,
  Users,
  ClipboardCheck,
  X,
  Loader2,
} from "lucide-react";
import {
  cn,
  Button,
  Input,
  Label,
  Card,
  CardContent,  Badge,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from "@bidconnect/ui";
import { useCreateProject } from "@/hooks/use-projects";
import { formatCurrency } from "@bidconnect/utils/currency";
import { US_TIMEZONES, ALL_TIMEZONES } from "@bidconnect/utils/timezones";
import { CSI_DIVISIONS, formatCsiDivision } from "@bidconnect/utils/csi";
import { US_STATES } from "@bidconnect/utils/timezones";
import type { ProjectType, ProjectVisibility } from "@bidconnect/types";

// ─────────────────────────────────────────
// Schema
// ─────────────────────────────────────────

const projectSchema = z.object({
  // Step 1 -- Basics
  name: z.string().min(1, "Project name is required").max(200),
  number: z.string().optional(),  clientName: z.string().optional(),
  projectType: z.enum([
    "GENERAL_CONTRACTING",
    "CM_AT_RISK",
    "DESIGN_BUILD",
    "OWNER_CONTROLLED",
    "OTHER",
  ]),
  estimatedValue: z.string().optional(),
  description: z.string().optional(),

  // Step 2 -- Dates & Location
  bidsdueat: z.string().min(1, "Bids due date is required"),
  bidsDueTimezone: z.string().min(1, "Timezone is required"),
  dueToClientAt: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),

  // Step 3 -- Team & Settings
  leadUserId: z.string().optional(),
  officeId: z.string().optional(),  visibility: z.enum(["PUBLIC", "PRIVATE", "INVITE_ONLY"]),
  csiDivisions: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

type ProjectFormData = z.infer<typeof projectSchema>;

// ─────────────────────────────────────────
// Steps config
// ─────────────────────────────────────────

const STEPS = [
  { id: 1, title: "Basics", icon: Building2 },
  { id: 2, title: "Dates & Location", icon: CalendarDays },
  { id: 3, title: "Team & Settings", icon: Users },
  { id: 4, title: "Review & Create", icon: ClipboardCheck },
] as const;

const PROJECT_TYPES: { value: ProjectType; label: string }[] = [
  { value: "GENERAL_CONTRACTING", label: "General Contracting" },
  { value: "CM_AT_RISK", label: "CM at Risk" },
  { value: "DESIGN_BUILD", label: "Design-Build" },
  { value: "OWNER_CONTROLLED", label: "Owner Controlled" },
  { value: "OTHER", label: "Other" },];

const VISIBILITY_OPTIONS: { value: ProjectVisibility; label: string; desc: string }[] = [
  { value: "PUBLIC", label: "Public", desc: "Visible to anyone in your organization" },
  { value: "PRIVATE", label: "Private", desc: "Only team members can see this project" },
  { value: "INVITE_ONLY", label: "Invite Only", desc: "Only invited subcontractors can access bid documents" },
];

// ─────────────────────────────────────────
// Step Indicator
// ─────────────────────────────────────────

function StepIndicator({
  currentStep,
  completedSteps,
}: {
  currentStep: number;
  completedSteps: Set<number>;
}) {
  return (
    <nav className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const isActive = step.id === currentStep;
        const isCompleted = completedSteps.has(step.id);        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                  isActive
                    ? "border-sky-500 bg-sky-500/10 text-sky-400"
                    : isCompleted
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                      : "border-slate-700 bg-slate-800/50 text-slate-500"
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span
                className={cn(
                  "text-xs font-medium",
                  isActive                    ? "text-sky-400"
                    : isCompleted
                      ? "text-emerald-400"
                      : "text-slate-500"
                )}
              >
                {step.title}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-3 mt-[-20px] h-0.5 w-16 sm:w-24",
                  completedSteps.has(step.id)
                    ? "bg-emerald-500/50"
                    : "bg-slate-700"
                )}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
// ─────────────────────────────────────────
// Step 1 -- Basics
// ─────────────────────────────────────────

function StepBasics({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectFormData>>;
}) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const projectType = watch("projectType");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">Project Basics</h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter the fundamental details for your new project.
        </p>
      </div>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name" className="text-slate-300">
            Project Name <span className="text-red-400">*</span>
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g. Downtown Office Tower"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="number" className="text-slate-300">
            Project Number
          </Label>
          <Input
            id="number"
            {...register("number")}
            placeholder="Auto-assigned if left blank"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20 font-mono"          />
        </div>

        <div>
          <Label htmlFor="clientName" className="text-slate-300">
            Client / Owner
          </Label>
          <Input
            id="clientName"
            {...register("clientName")}
            placeholder="e.g. Metro Development Corp"
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
          />
        </div>

        <div>
          <Label className="text-slate-300">Project Type</Label>
          <Select
            value={projectType}
            onValueChange={(val) => setValue("projectType", val as ProjectType)}
          >
            <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>            <SelectContent className="bg-slate-800 border-slate-700">
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

        <div>
          <Label htmlFor="estimatedValue" className="text-slate-300">
            Estimated Value
          </Label>
          <div className="relative mt-1.5">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
              $
            </span>
            <Input
              id="estimatedValue"
              {...register("estimatedValue")}
              placeholder="0.00"              className="pl-7 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20 tabular-nums"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="description" className="text-slate-300">
            Description
          </Label>
          <Textarea
            id="description"
            {...register("description")}
            placeholder="Brief project description..."
            rows={4}
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20 resize-none"
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Step 2 -- Dates & Location
// ─────────────────────────────────────────
function StepDatesLocation({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectFormData>>;
}) {
  const {
    register,
    formState: { errors },
    setValue,
    watch,
  } = form;
  const timezone = watch("bidsDueTimezone");
  const stateVal = watch("state");

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Dates & Location
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Set bid deadlines and project location.
        </p>
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="bidsdueat" className="text-slate-300">
              Bids Due Date & Time <span className="text-red-400">*</span>
            </Label>
            <Input
              id="bidsdueat"
              type="datetime-local"
              {...register("bidsdueat")}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20 [color-scheme:dark]"
            />
            {errors.bidsdueat && (
              <p className="mt-1 text-xs text-red-400">
                {errors.bidsdueat.message}
              </p>
            )}
          </div>

          <div>
            <Label className="text-slate-300">
              Timezone <span className="text-red-400">*</span>
            </Label>            <Select
              value={timezone}
              onValueChange={(val) => setValue("bidsDueTimezone", val)}
            >
              <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200">
                <SelectValue placeholder="Select timezone" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
                {ALL_TIMEZONES.map((tz) => (
                  <SelectItem
                    key={tz.value}
                    value={tz.value}
                    className="text-slate-300 focus:bg-slate-700 focus:text-slate-100"
                  >
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.bidsDueTimezone && (
              <p className="mt-1 text-xs text-red-400">
                {errors.bidsDueTimezone.message}
              </p>
            )}
          </div>        </div>

        <div>
          <Label htmlFor="dueToClientAt" className="text-slate-300">
            Due to Client Date & Time
          </Label>
          <Input
            id="dueToClientAt"
            type="datetime-local"
            {...register("dueToClientAt")}
            className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20 [color-scheme:dark]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate" className="text-slate-300">
              Start Date
            </Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20 [color-scheme:dark]"
            />          </div>
          <div>
            <Label htmlFor="endDate" className="text-slate-300">
              End Date
            </Label>
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20 [color-scheme:dark]"
            />
          </div>
        </div>

        <Separator className="bg-slate-800" />

        <h3 className="text-sm font-medium text-slate-300">Project Address</h3>

        <div>
          <Label htmlFor="addressLine1" className="text-slate-300">
            Street Address
          </Label>
          <Input
            id="addressLine1"
            {...register("addressLine1")}
            placeholder="123 Main St"            className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <Label htmlFor="city" className="text-slate-300">
              City
            </Label>
            <Input
              id="city"
              {...register("city")}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
            />
          </div>
          <div>
            <Label className="text-slate-300">State</Label>
            <Select
              value={stateVal || ""}
              onValueChange={(val) => setValue("state", val)}
            >
              <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200">
                <SelectValue placeholder="State" />              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
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
            <Label htmlFor="zip" className="text-slate-300">
              ZIP
            </Label>
            <Input
              id="zip"
              {...register("zip")}
              maxLength={10}
              className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
            />          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Step 3 -- Team & Settings
// ─────────────────────────────────────────

function StepTeamSettings({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectFormData>>;
}) {
  const { setValue, watch } = form;
  const visibility = watch("visibility");
  const csiDivisions = watch("csiDivisions");
  const tags = watch("tags");
  const [tagInput, setTagInput] = useState("");
  const [csiSearch, setCsiSearch] = useState("");

  const filteredDivisions = csiSearch
    ? CSI_DIVISIONS.filter(        (d) =>
          d.code.includes(csiSearch.toLowerCase()) ||
          d.name.toLowerCase().includes(csiSearch.toLowerCase())
      )
    : CSI_DIVISIONS;

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setValue("tags", [...tags, trimmed]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setValue(
      "tags",
      tags.filter((t) => t !== tag)
    );
  }

  function toggleCsi(code: string) {
    if (csiDivisions.includes(code)) {
      setValue(
        "csiDivisions",
        csiDivisions.filter((c) => c !== code)      );
    } else {
      setValue("csiDivisions", [...csiDivisions, code]);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Team & Settings
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Configure project access and team assignments.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-slate-300">Project Lead</Label>
          <div className="mt-1.5 flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-400 text-xs font-medium">
              You
            </div>
            <div>              <p className="text-sm text-slate-200">Current User (default)</p>
              <p className="text-xs text-slate-500">
                You can change this after project creation
              </p>
            </div>
          </div>
        </div>

        <div>
          <Label className="text-slate-300">Office</Label>
          <Select
            onValueChange={(val) => setValue("officeId", val)}
          >
            <SelectTrigger className="mt-1.5 bg-slate-800/50 border-slate-700 text-slate-200">
              <SelectValue placeholder="Default office" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              <SelectItem value="default" className="text-slate-300 focus:bg-slate-700 focus:text-slate-100">
                Main Office
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>          <Label className="text-slate-300">Visibility</Label>
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
                  onChange={() => setValue("visibility", opt.value)}
                  className="mt-0.5 accent-sky-500"
                />
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    {opt.label}
                  </p>
                  <p className="text-xs text-slate-500">{opt.desc}</p>                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-slate-300">CSI Divisions</Label>
          <Input
            placeholder="Search divisions..."
            value={csiSearch}
            onChange={(e) => setCsiSearch(e.target.value)}
            className="mt-1.5 mb-2 bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
          />
          {csiDivisions.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {csiDivisions.map((code) => (
                <Badge
                  key={code}
                  variant="secondary"
                  className="bg-sky-500/10 text-sky-400 border-sky-500/20 gap-1 pr-1"
                >
                  Div {code}
                  <button                    type="button"
                    onClick={() => toggleCsi(code)}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-sky-500/20"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-700 bg-slate-800/30 scrollbar-dark">
            {filteredDivisions.map((d) => (
              <label
                key={d.code}
                className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm hover:bg-slate-700/50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={csiDivisions.includes(d.code)}
                  onChange={() => toggleCsi(d.code)}
                  className="accent-sky-500"
                />
                <span className="font-mono text-xs text-slate-500">
                  {d.code}                </span>
                <span className="text-slate-300">{d.name}</span>
              </label>
            ))}
          </div>
        </div>

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
              placeholder="Add a tag and press Enter"
              className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-600 focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
            />
            <Button
              type="button"
              variant="outline"              onClick={addTag}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
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
              ))}            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Step 4 -- Review
// ─────────────────────────────────────────

function StepReview({
  form,
}: {
  form: ReturnType<typeof useForm<ProjectFormData>>;
}) {
  const values = form.getValues();
  const typeLabel =
    PROJECT_TYPES.find((t) => t.value === values.projectType)?.label ?? values.projectType;

  const sections = [
    {
      title: "Basics",
      items: [        { label: "Project Name", value: values.name },
        { label: "Project Number", value: values.number || "Auto-assigned" },
        { label: "Client / Owner", value: values.clientName || "--" },
        { label: "Project Type", value: typeLabel },
        { label: "Estimated Value", value: values.estimatedValue ? formatCurrency(values.estimatedValue) : "--" },
        { label: "Description", value: values.description || "--" },
      ],
    },
    {
      title: "Dates & Location",
      items: [
        { label: "Bids Due", value: values.bidsdueat ? new Date(values.bidsdueat).toLocaleString() : "--" },
        { label: "Timezone", value: values.bidsDueTimezone },
        { label: "Due to Client", value: values.dueToClientAt ? new Date(values.dueToClientAt).toLocaleString() : "--" },
        { label: "Start Date", value: values.startDate || "--" },
        { label: "End Date", value: values.endDate || "--" },
        {
          label: "Address",
          value: [values.addressLine1, values.city, values.state, values.zip]
            .filter(Boolean)
            .join(", ") || "--",
        },
      ],
    },
    {      title: "Team & Settings",
      items: [
        { label: "Visibility", value: values.visibility },
        {
          label: "CSI Divisions",
          value: values.csiDivisions.length > 0 ? values.csiDivisions.map((c) => `Div ${c}`).join(", ") : "--",
        },
        {
          label: "Tags",
          value: values.tags.length > 0 ? values.tags.join(", ") : "--",
        },
      ],
    },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">
          Review & Create
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Verify all details before creating your project.
        </p>
      </div>
      {sections.map((section) => (
        <Card
          key={section.title}
          className="bg-slate-800/40 border-slate-700"
        >
          <CardContent className="pt-4">
            <h3 className="text-sm font-medium text-sky-400 mb-3">
              {section.title}
            </h3>
            <dl className="space-y-2">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-4"
                >
                  <dt className="text-sm text-slate-500 shrink-0">
                    {item.label}
                  </dt>
                  <dd className="text-sm text-slate-200 text-right break-words">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export default function NewProjectPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const createProject = useCreateProject();
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      number: "",
      clientName: "",      projectType: "GENERAL_CONTRACTING",
      estimatedValue: "",
      description: "",
      bidsdueat: "",
      bidsDueTimezone: "America/Chicago",
      dueToClientAt: "",
      startDate: "",
      endDate: "",
      addressLine1: "",
      city: "",
      state: "",
      zip: "",
      leadUserId: session?.user?.id ?? "",
      officeId: "",
      visibility: "PRIVATE",
      csiDivisions: [],
      tags: [],
    },
  });

  async function validateCurrentStep(): Promise<boolean> {
    const fieldsPerStep: Record<number, (keyof ProjectFormData)[]> = {
      1: ["name", "projectType"],
      2: ["bidsdueat", "bidsDueTimezone"],
      3: ["visibility"],      4: [],
    };

    const fields = fieldsPerStep[step] ?? [];
    if (fields.length === 0) return true;

    const valid = await form.trigger(fields);
    return valid;
  }

  async function handleNext() {
    const valid = await validateCurrentStep();
    if (!valid) return;
    setCompletedSteps((prev) => new Set([...prev, step]));
    setStep((s) => Math.min(s + 1, 4));
  }

  function handleBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleCreate() {
    const valid = await form.trigger();
    if (!valid) return;

    const values = form.getValues();    try {
      const result = await createProject.mutateAsync({
        name: values.name,
        number: values.number || undefined,
        clientName: values.clientName || undefined,
        projectType: values.projectType,
        estimatedValue: values.estimatedValue || undefined,
        description: values.description || undefined,
        bidsdueat: values.bidsdueat ? new Date(values.bidsdueat).toISOString() : undefined,
        bidsDueTimezone: values.bidsDueTimezone,
        dueToClientAt: values.dueToClientAt
          ? new Date(values.dueToClientAt).toISOString()
          : undefined,
        startDate: values.startDate || undefined,
        endDate: values.endDate || undefined,
        addressLine1: values.addressLine1 || undefined,
        city: values.city || undefined,
        state: values.state || undefined,
        zip: values.zip || undefined,
        leadUserId: values.leadUserId || session?.user?.id || "",
        officeId: values.officeId || undefined,
        visibility: values.visibility,
        csiDivisions: values.csiDivisions,
        tags: values.tags,      } as any);

      router.push(`/projects/${result.id}/bid-management`);
    } catch {
      // Error state is handled by mutation
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/projects")}
            className="text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-slate-100">
            New Project
          </h1>        </div>
        <span className="text-sm text-slate-500">
          Step {step} of {STEPS.length}
        </span>
      </header>

      {/* Step Indicator */}
      <div className="border-b border-slate-800/60 bg-slate-900/80 px-6 py-5">
        <StepIndicator currentStep={step} completedSteps={completedSteps} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-dark">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          <FormProvider {...form}>
            <form onSubmit={(e) => e.preventDefault()}>
              {step === 1 && <StepBasics form={form} />}
              {step === 2 && <StepDatesLocation form={form} />}
              {step === 3 && <StepTeamSettings form={form} />}
              {step === 4 && <StepReview form={form} />}
            </form>
          </FormProvider>
        </div>
      </div>
      {/* Footer */}
      <footer className="flex items-center justify-between border-t border-slate-800 px-6 py-4">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={step === 1}
          className="text-slate-400 hover:text-slate-200 hover:bg-slate-800 gap-2 disabled:opacity-40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {step < 4 ? (
          <Button
            onClick={handleNext}
            className="bg-sky-600 hover:bg-sky-500 text-white gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleCreate}
            disabled={createProject.isPending}            className="bg-sky-600 hover:bg-sky-500 text-white gap-2 disabled:opacity-60"
          >
            {createProject.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Create Project
              </>
            )}
          </Button>
        )}
      </footer>
    </div>
  );
}