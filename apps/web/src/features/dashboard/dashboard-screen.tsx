"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ActivityEvent, Build, Project } from "@apppilot/contracts";
import {
  ArrowRight,
  ArrowUp,
  Bot,
  CheckCircle2,
  FileArchive,
  FolderKanban,
  FolderPlus,
  Hammer,
  Package,
  Plus,
  Sparkles,
  TestTube2,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { PageBody, Meter, SectionTitle } from "@/components/layout/page";
import { EmptyState, ErrorState, QueryView } from "@/components/states/states";
import { AgentStatusBadge, BuildStatusBadge } from "@/components/status/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, Skeleton } from "@/components/ui/primitives";
import { ProjectTechBadges } from "@/features/projects/project-meta";
import { ProjectPreview } from "@/features/projects/project-preview";
import { useActivity, useAgentTasks, useBuilds, useProjects, useSession, useUsage } from "@/lib/api/hooks";
import { cn, formatBytes, formatDuration, formatNumber, formatRelative } from "@/lib/utils";

const ACTIVITY_ICON: Record<ActivityEvent["kind"], LucideIcon> = {
  project_created: FolderPlus,
  agent_task_started: Bot,
  agent_task_completed: Sparkles,
  agent_task_failed: XCircle,
  build_succeeded: CheckCircle2,
  build_failed: XCircle,
  tests_passed: TestTube2,
  tests_failed: TestTube2,
  files_changed: Sparkles,
};

const IDEAS = [
  "A habit tracker with daily reminders and a weekly streak chart",
  "An expense splitter for trips with offline support",
  "A recipe app with a shopping list and a cooking timer",
  "A trail finder with maps, filters and saved hikes",
];

function greeting() {
  const h = new Date().getHours();
  return h < 5 ? "Working late" : h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

/* ------------------------------------------------------------------ */
/* Hero: the prompt is the page.                                       */
/* ------------------------------------------------------------------ */

function PromptHero({ firstName }: { firstName?: string }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const q = new URLSearchParams({ method: "prompt" });
    if (text.trim()) q.set("description", text.trim());
    router.push(`/projects/new?${q}`);
  };

  return (
    <section aria-label="Start a new app" className="relative mx-auto max-w-3xl pb-4 pt-2 text-center sm:pt-8">
      <p className="animate-fade-up">
        <span className="inline-flex items-center gap-2 rounded-full border border-border-strong bg-surface/70 py-1 pl-1.5 pr-3.5 text-[13px] text-muted-foreground backdrop-blur">
          <span className="grid size-5 place-items-center rounded-full bg-brand text-white">
            <Sparkles className="size-3" aria-hidden />
          </span>
          {greeting()}
          {firstName ? `, ${firstName}` : ""}
        </span>
      </p>
      <h1 className="mt-5 animate-fade-up text-balance text-[clamp(2.25rem,5.5vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.04em] [animation-delay:80ms]">
        What will you <span className="text-brand animate-pan">build</span> today?
      </h1>
      <p className="mx-auto mt-4 max-w-xl animate-fade-up text-pretty text-[16px] leading-relaxed text-muted-foreground [animation-delay:160ms]">
        Describe your Android app. AppPilot plans it, writes the code, runs Gradle and asks for your review.
      </p>

      <form
        className="group/prompt relative mt-8 animate-fade-up text-left [animation-delay:240ms]"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-brand opacity-25 blur-3xl transition-opacity duration-500 group-focus-within/prompt:opacity-45" />
        <div className="rounded-[26px] bg-linear-to-b from-brand-2/60 via-border-strong to-border p-px transition-all duration-300 focus-within:from-brand-1 focus-within:via-brand-2 focus-within:to-brand-3">
          <div className="rounded-[25px] bg-card p-3 sm:p-4">
            <label htmlFor="quick-prompt" className="sr-only">
              Describe the app
            </label>
            <textarea
              id="quick-prompt"
              ref={ref}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={3}
              placeholder="Ask AppPilot to build a habit tracker with daily reminders and a weekly streak chart…"
              className="block min-h-[96px] w-full resize-none bg-transparent px-2 py-1.5 text-[16px] leading-relaxed text-foreground outline-none placeholder:text-subtle-foreground"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href="/projects/new?method=zip"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border-strong px-3 text-[13px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft hover:text-foreground"
                >
                  <FileArchive className="size-3.5" aria-hidden /> Upload project
                </Link>
                <Link
                  href="/projects/new?method=apk"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border-strong px-3 text-[13px] text-muted-foreground transition-colors hover:border-primary/50 hover:bg-primary-soft hover:text-foreground"
                >
                  <Package className="size-3.5" aria-hidden /> Analyze APK
                </Link>
              </div>
              <div className="flex items-center gap-3">
                <span className="hidden text-[12px] text-subtle-foreground sm:inline">Enter to continue · Shift+Enter for a new line</span>
                <button
                  type="submit"
                  aria-label="Continue"
                  className="grid size-10 place-items-center rounded-full bg-brand text-white shadow-[0_8px_22px_-8px_var(--brand-glow)] transition-all duration-200 hover:scale-105 hover:brightness-110 active:scale-95"
                >
                  <ArrowUp className="size-5" aria-hidden />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>

      <div className="mt-5 flex animate-fade-up flex-wrap justify-center gap-2 [animation-delay:320ms]" aria-label="Ideas">
        {IDEAS.map((idea) => (
          <button
            key={idea}
            type="button"
            onClick={() => {
              setText(idea);
              ref.current?.focus();
            }}
            className="max-w-full truncate rounded-full border border-border bg-surface/60 px-3.5 py-1.5 text-[13px] text-muted-foreground backdrop-blur transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:bg-primary-soft hover:text-foreground"
          >
            {idea.length > 42 ? `${idea.slice(0, 40)}…` : idea}
          </button>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Stat tiles                                                          */
/* ------------------------------------------------------------------ */

const STAT_TONE = {
  primary: "bg-primary-soft text-primary ring-primary/25",
  ai: "bg-ai-soft text-ai ring-ai/25",
  success: "bg-success-soft text-success ring-success/25",
  danger: "bg-destructive-soft text-destructive ring-destructive/25",
} as const;

function Stat({
  label,
  value,
  loading,
  error,
  href,
  icon: Icon,
  tone,
  index,
}: {
  label: string;
  value: React.ReactNode;
  loading: boolean;
  error?: boolean;
  href?: string;
  icon: LucideIcon;
  tone: keyof typeof STAT_TONE;
  index: number;
}) {
  const body = (
    <div className="flex items-center gap-4 p-4">
      <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl ring-1", STAT_TONE[tone])}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="font-display text-[30px] font-semibold leading-none tabular-nums tracking-tight">
          {loading ? <Skeleton className="h-7 w-12" /> : error ? <span className="text-sm font-normal text-muted-foreground">Unavailable</span> : value}
        </div>
        <p className="mt-1.5 text-[13px] leading-tight text-muted-foreground">{label}</p>
      </div>
    </div>
  );
  const cls = "block rounded-2xl border border-border bg-card shadow-card transition-all duration-300";
  const style = { "--i": index } as React.CSSProperties;
  return href ? (
    <Link href={href} style={style} className={cn(cls, "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-pop")}>
      {body}
    </Link>
  ) : (
    <div style={style} className={cls}>
      {body}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project gallery                                                     */
/* ------------------------------------------------------------------ */

function ProjectTile({ project, index }: { project: Project; index: number }) {
  return (
    <Link
      href={`/projects/${project.id}/ide`}
      style={{ "--i": index } as React.CSSProperties}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-pop"
    >
      <ProjectPreview project={project} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-display text-[17px] font-semibold tracking-tight">{project.name}</h3>
          {project.activeTaskCount > 0 ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ai-soft px-2 py-0.5 text-[12px] font-medium text-ai">
              <span className="size-1.5 animate-glow rounded-full bg-ai" aria-hidden />
              {project.activeTaskCount} running
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 min-h-10 text-[13.5px] leading-relaxed text-muted-foreground">{project.description}</p>
        <div className="mt-3">
          <ProjectTechBadges project={project} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-[13px] text-muted-foreground">
          <span>Edited {formatRelative(project.updatedAt)}</span>
          {project.lastBuild ? <BuildStatusBadge status={project.lastBuild.status} /> : <span>No builds</span>}
        </div>
      </div>
    </Link>
  );
}

function NewProjectTile({ index }: { index: number }) {
  return (
    <Link
      href="/projects/new"
      style={{ "--i": index } as React.CSSProperties}
      className="group flex min-h-[18rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border-strong bg-surface/40 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:bg-primary-soft"
    >
      <span className="grid size-12 place-items-center rounded-2xl bg-brand text-white shadow-[0_10px_26px_-10px_var(--brand-glow)] transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110">
        <Plus className="size-6" aria-hidden />
      </span>
      <span className="font-display text-[17px] font-semibold tracking-tight">New project</span>
      <span className="max-w-[14rem] text-[13px] text-muted-foreground">Start from a prompt, a ZIP or an APK.</span>
    </Link>
  );
}

function RecentProjects() {
  const projects = useProjects();
  const items = [...(projects.data?.items ?? [])].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 3);
  return (
    <section aria-labelledby="recent-projects" className="mt-12">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 id="recent-projects" className="font-display text-[22px] font-semibold tracking-tight">
            Pick up where you left off
          </h2>
          <p className="mt-0.5 text-[14px] text-muted-foreground">Your most recently edited projects.</p>
        </div>
        <Link href="/projects" className="group inline-flex shrink-0 items-center gap-1 text-[14px] font-medium text-primary">
          View all
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>
      {projects.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy="true" aria-label="Loading projects">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[18rem] rounded-2xl" />
          ))}
        </div>
      ) : projects.isError ? (
        <Card>
          <ErrorState error={projects.error} onRetry={() => projects.refetch()} />
        </Card>
      ) : items.length === 0 ? (
        <Card className="overflow-hidden">
          <EmptyState
            icon={<FolderKanban />}
            title="No projects yet"
            action={
              <Button asChild>
                <Link href="/projects/new">
                  <Sparkles /> Create your first app
                </Link>
              </Button>
            }
          >
            Describe an app above and AppPilot will generate your first Gradle project.
          </EmptyState>
        </Card>
      ) : (
        <div className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {items.map((p, i) => (
            <ProjectTile key={p.id} project={p} index={i} />
          ))}
          <NewProjectTile index={items.length} />
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Builds, activity, usage, agents                                     */
/* ------------------------------------------------------------------ */

function BuildRow({ b, projectName }: { b: Build; projectName?: string }) {
  return (
    <Link
      href={`/projects/${b.projectId}/builds?build=${b.id}`}
      className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-0.5 px-5 py-3 transition-colors duration-150 hover:bg-primary-soft sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]"
    >
      <span className="truncate text-[14px]">
        <span className="font-medium">{projectName ?? b.projectId}</span> <span className="text-muted-foreground">#{b.number}</span>
      </span>
      <span className="hidden truncate font-mono text-[13px] text-muted-foreground sm:block">{b.gradleTask}</span>
      <span className="hidden text-[13px] tabular-nums text-muted-foreground sm:block">
        {b.status === "running" ? "running" : formatDuration(b.durationMs)}
      </span>
      <BuildStatusBadge status={b.status} className="justify-self-end" />
    </Link>
  );
}

export function DashboardScreen() {
  const session = useSession();
  const projects = useProjects();
  const activeTasks = useAgentTasks({ status: "active" });
  const builds = useBuilds();
  const usage = useUsage();
  const activity = useActivity();

  const names = new Map(projects.data?.items.map((p) => [p.id, p.name]));
  const finished = builds.data?.filter((b) => b.status === "succeeded" || b.status === "failed") ?? [];
  const firstName = session.data?.user.name.split(" ")[0];
  const failed = finished.filter((b) => b.status === "failed").length;
  const suffix = finished.length ? ` (last ${finished.length})` : "";

  return (
    <PageBody className="max-w-[1280px]">
      <PromptHero firstName={firstName} />

      <section aria-label="Summary" className="stagger mt-12 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat index={0} icon={FolderKanban} tone="primary" label="Projects" href="/projects" loading={projects.isPending} error={projects.isError} value={projects.data?.total ?? projects.data?.items.length} />
        <Stat index={1} icon={Bot} tone="ai" label="Active AI tasks" loading={activeTasks.isPending} error={activeTasks.isError} value={activeTasks.data?.length} />
        <Stat index={2} icon={CheckCircle2} tone="success" label={`Successful builds${suffix}`} loading={builds.isPending} error={builds.isError} value={finished.filter((b) => b.status === "succeeded").length} />
        <Stat index={3} icon={XCircle} tone={failed ? "danger" : "primary"} label={`Failed builds${suffix}`} loading={builds.isPending} error={builds.isError} value={failed} />
      </section>

      <RecentProjects />

      <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <section>
            <SectionTitle action={<Hammer className="size-4 text-muted-foreground" aria-hidden />}>Recent builds</SectionTitle>
            <Card className="overflow-hidden">
              <QueryView
                query={builds}
                compact
                isEmpty={(d) => d.length === 0}
                empty={<EmptyState compact title="No builds yet">Builds appear here after you or an agent run Gradle.</EmptyState>}
              >
                {(d) => (
                  <div className="divide-y divide-border">
                    {d.slice(0, 6).map((b) => (
                      <BuildRow key={b.id} b={b} projectName={names.get(b.projectId)} />
                    ))}
                  </div>
                )}
              </QueryView>
            </Card>
          </section>

          <section>
            <SectionTitle>Recent activity</SectionTitle>
            <Card>
              <QueryView
                query={activity}
                compact
                isEmpty={(d) => d.length === 0}
                empty={<EmptyState compact title="No activity yet">Create a project to get started.</EmptyState>}
              >
                {(d) => (
                  <ol className="divide-y divide-border">
                    {d.map((e) => {
                      const Icon = ACTIVITY_ICON[e.kind];
                      const bad = e.kind.endsWith("failed");
                      const ai = e.kind.startsWith("agent");
                      return (
                        <li key={e.id} className="flex items-start gap-3 px-5 py-3">
                          <span
                            className={cn(
                              "mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg",
                              bad ? "bg-destructive-soft text-destructive" : ai ? "bg-ai-soft text-ai" : "bg-surface-3 text-muted-foreground",
                            )}
                          >
                            <Icon className="size-3.5" aria-hidden />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[14px]">{e.message}</p>
                            <p className="text-[13px] text-muted-foreground">
                              <Link href={`/projects/${e.projectId}/ide`} className="hover:text-foreground">
                                {e.projectName}
                              </Link>{" "}
                              · <time dateTime={e.at}>{formatRelative(e.at)}</time>
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </QueryView>
            </Card>
          </section>
        </div>

        <aside className="grid min-w-0 grid-cols-[minmax(0,1fr)] content-start gap-6">
          <section>
            <SectionTitle>Agent tasks running</SectionTitle>
            <Card>
              <QueryView
                query={activeTasks}
                compact
                isEmpty={(d) => d.length === 0}
                empty={<EmptyState compact icon={<Bot />} title="No agents running">Ask the assistant in any project to start one.</EmptyState>}
              >
                {(d) => (
                  <ul className="divide-y divide-border">
                    {d.map((t) => (
                      <li key={t.id}>
                        <Link href={`/projects/${t.projectId}/agent?task=${t.id}`} className="block px-5 py-3 transition-colors duration-150 hover:bg-primary-soft">
                          <div className="flex items-center justify-between gap-2">
                            <span className="truncate text-[14px] font-medium">{t.title}</span>
                            <AgentStatusBadge status={t.status} />
                          </div>
                          <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
                            {names.get(t.projectId) ?? t.projectId}
                            {t.currentStep ? ` · ${t.currentStep}` : ""}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </QueryView>
            </Card>
          </section>

          <section>
            <SectionTitle>
              <Link href="/billing" className="hover:underline">
                Usage this period
              </Link>
            </SectionTitle>
            <Card>
              <CardContent className="grid gap-4">
                {usage.isPending ? (
                  <Skeleton className="h-24" />
                ) : usage.isError ? (
                  <ErrorState error={usage.error} onRetry={() => usage.refetch()} compact />
                ) : (
                  <>
                    <Meter label="AI tokens" used={usage.data.aiTokens.used} limit={usage.data.aiTokens.limit} format={formatNumber} />
                    <Meter label="Storage" used={usage.data.storage.usedBytes} limit={usage.data.storage.limitBytes} format={(n) => formatBytes(n)} />
                    <Meter label="Build minutes" used={usage.data.buildMinutes.used} limit={usage.data.buildMinutes.limit} />
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </aside>
      </div>
    </PageBody>
  );
}
