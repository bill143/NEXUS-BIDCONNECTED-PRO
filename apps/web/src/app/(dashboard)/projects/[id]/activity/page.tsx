"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import {
  MessageSquare,
  Send,
  Package,
  FileText,
  Users,
  Bell,
  Settings,
  Award,
  Eye,
  XCircle,
  Clock,
  ChevronDown,
  Loader2,
  Plus,
  Upload,
  UserPlus,
  UserMinus,
  Mail,
  RotateCw,
} from "lucide-react";
import {
  cn,
  Button,
  Textarea,
  Avatar,
  AvatarFallback,
  Separator,
  Skeleton,
} from "@bidconnect/ui";import {
  useProjectActivity,
  useProjectComments,
  useCreateComment,
} from "@/hooks/use-projects";
import { formatRelativeTime } from "@bidconnect/utils/date";
import type { ActivityAction } from "@bidconnect/types";

// ─────────────────────────────────────────
// Activity icon mapping
// ─────────────────────────────────────────

function getActivityIcon(action: string) {
  const map: Record<string, { icon: typeof Package; color: string }> = {
    PROJECT_CREATED: { icon: Plus, color: "text-emerald-400 bg-emerald-500/10" },
    PROJECT_UPDATED: { icon: Settings, color: "text-sky-400 bg-sky-500/10" },
    PROJECT_CLOSED: { icon: XCircle, color: "text-slate-400 bg-slate-500/10" },
    PROJECT_ARCHIVED: { icon: Clock, color: "text-slate-400 bg-slate-500/10" },
    PROJECT_DUPLICATED: { icon: RotateCw, color: "text-sky-400 bg-sky-500/10" },
    BID_PACKAGE_CREATED: { icon: Package, color: "text-sky-400 bg-sky-500/10" },
    BID_PACKAGE_UPDATED: { icon: Package, color: "text-sky-400 bg-sky-500/10" },
    BID_PACKAGE_CLOSED: { icon: Package, color: "text-slate-400 bg-slate-500/10" },
    ITB_SENT: { icon: Mail, color: "text-sky-400 bg-sky-500/10" },
    ITB_RESENT: { icon: Mail, color: "text-sky-400 bg-sky-500/10" },
    BID_VIEWED: { icon: Eye, color: "text-amber-400 bg-amber-500/10" },
    BID_DECLINED: { icon: XCircle, color: "text-red-400 bg-red-500/10" },
    BID_SUBMITTED: { icon: Send, color: "text-emerald-400 bg-emerald-500/10" },
    BID_REVISED: { icon: RotateCw, color: "text-amber-400 bg-amber-500/10" },
    BID_AWARDED: { icon: Award, color: "text-emerald-400 bg-emerald-500/10" },    DOCUMENT_UPLOADED: { icon: Upload, color: "text-sky-400 bg-sky-500/10" },
    DOCUMENT_VERSIONED: { icon: FileText, color: "text-sky-400 bg-sky-500/10" },
    DOCUMENT_DELETED: { icon: FileText, color: "text-red-400 bg-red-500/10" },
    ADDENDUM_PUBLISHED: { icon: FileText, color: "text-amber-400 bg-amber-500/10" },
    TEAM_MEMBER_ADDED: { icon: UserPlus, color: "text-emerald-400 bg-emerald-500/10" },
    TEAM_MEMBER_REMOVED: { icon: UserMinus, color: "text-red-400 bg-red-500/10" },
    COMMENT_POSTED: { icon: MessageSquare, color: "text-sky-400 bg-sky-500/10" },
    COMMENT_DELETED: { icon: MessageSquare, color: "text-red-400 bg-red-500/10" },
    PROJECT_SETTINGS_CHANGED: { icon: Settings, color: "text-slate-400 bg-slate-500/10" },
    COMPANY_ADDED: { icon: Users, color: "text-sky-400 bg-sky-500/10" },
    CONTACT_ADDED: { icon: UserPlus, color: "text-sky-400 bg-sky-500/10" },
  };

  return map[action] ?? { icon: Bell, color: "text-slate-400 bg-slate-500/10" };
}

function formatAction(action: string): string {
  return action
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─────────────────────────────────────────
// Comment Composer
// ─────────────────────────────────────────

function CommentComposer({ projectId }: { projectId: string }) {
  const [body, setBody] = useState("");
  const createComment = useCreateComment(projectId);
  async function handleSubmit() {
    if (!body.trim()) return;

    // Extract @mentions -- simple pattern
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(body)) !== null) {
      mentions.push(match[1]);
    }

    try {
      await createComment.mutateAsync({
        body: body.trim(),
        mentionedUserIds: mentions,
      });
      setBody("");
    } catch {
      // Error handled by mutation state
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/40 p-4">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Add a comment... Use @name to mention team members"
        rows={3}
        className="bg-slate-800/50 border-slate-700 text-slate-200 placeholder:text-slate-500 resize-none focus-visible:border-sky-500/50 focus-visible:ring-sky-500/20"
      />      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Use @username to mention team members
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!body.trim() || createComment.isPending}
          className="bg-sky-600 hover:bg-sky-500 text-white gap-2 disabled:opacity-40"
          size="sm"
        >
          {createComment.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Send className="h-3.5 w-3.5" />
          )}
          Post Comment
        </Button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Activity Item
// ─────────────────────────────────────────

function ActivityItem({ item }: { item: any }) {
  const { icon: Icon, color } = getActivityIcon(item.action ?? item.type ?? "");
  const isComment = item.action === "COMMENT_POSTED" || item.body;
  const author = item.author ?? item.actor;
  return (
    <div className="flex gap-3 py-3">
      {/* Icon / Avatar */}
      {isComment && author ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarFallback className="bg-sky-500/10 text-sky-400 text-[10px]">
            {(author.firstName?.[0] ?? "") + (author.lastName?.[0] ?? "")}
          </AvatarFallback>
        </Avatar>
      ) : (
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            color
          )}
        >
          <Icon className="h-4 w-4" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200">
            {author
              ? `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim()
              : item.actorName ?? "System"}
          </span>          <span className="text-xs text-slate-500">
            {formatRelativeTime(item.timestamp ?? item.createdAt)}
          </span>
        </div>

        {isComment && item.body ? (
          <p className="mt-1 text-sm text-slate-300 whitespace-pre-wrap">
            {item.body}
          </p>
        ) : (
          <p className="mt-0.5 text-sm text-slate-400">
            {formatAction(item.action ?? item.type ?? "activity")}
          </p>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// Loading skeleton
// ─────────────────────────────────────────

function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-3 py-3">
          <Skeleton className="h-8 w-8 rounded-full bg-slate-700" />          <div className="flex-1 space-y-2">
            <div className="flex gap-2">
              <Skeleton className="h-4 w-28 bg-slate-700" />
              <Skeleton className="h-4 w-16 bg-slate-700" />
            </div>
            <Skeleton className="h-4 w-48 bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────

export default function ActivityPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [page, setPage] = useState(1);

  const { data: activityResponse, isLoading: activityLoading } =
    useProjectActivity(projectId, { page, limit: 50 });
  const { data: commentsResponse, isLoading: commentsLoading } =
    useProjectComments(projectId, { page: 1, limit: 50 });

  const isLoading = activityLoading || commentsLoading;
  // Merge and sort activity + comments (newest first)
  const activityItems = (activityResponse as any)?.data ?? [];
  const commentItems = ((commentsResponse as any)?.data ?? []).map((c: any) => ({
    ...c,
    action: "COMMENT_POSTED",
    timestamp: c.createdAt,
  }));

  const allItems = [...activityItems, ...commentItems].sort((a, b) => {
    const dateA = new Date(a.timestamp ?? a.createdAt).getTime();
    const dateB = new Date(b.timestamp ?? b.createdAt).getTime();
    return dateB - dateA;
  });

  const hasMore = (activityResponse as any)?.meta?.hasMore ?? false;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-100">Activity</h2>

      {/* Comment Composer */}
      <CommentComposer projectId={projectId} />

      {/* Feed */}
      <div>
        {isLoading ? (
          <ActivitySkeleton />
        ) : allItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-800 bg-slate-900/50 py-16">            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800">
              <MessageSquare className="h-6 w-6 text-slate-500" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-300">
              No activity yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Comments and project updates will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {allItems.map((item: any, idx: number) => (
              <ActivityItem key={item.id ?? idx} item={item} />
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => p + 1)}
              className="border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200 gap-2"
            >
              <ChevronDown className="h-4 w-4" />
              Load More
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
