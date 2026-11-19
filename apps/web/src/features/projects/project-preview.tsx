import type { Project } from "@apppilot/contracts";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function hueOf(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

/**
 * A generated "device" preview: a unique hue per project, with the app's
 * initials on the screen. Put it inside a `group` element for the hover tilt.
 */
export function ProjectPreview({ project, className }: { project: Project; className?: string }) {
  const h = hueOf(project.id);
  return (
    <div
      aria-hidden
      className={cn("relative grid h-36 place-items-center overflow-hidden", className)}
      style={{
        backgroundImage: `radial-gradient(80% 90% at 20% 0%, oklch(0.62 0.2 ${h} / 0.55), transparent 70%), radial-gradient(70% 80% at 90% 100%, oklch(0.55 0.22 ${(h + 70) % 360} / 0.5), transparent 70%), linear-gradient(180deg, var(--surface-2), var(--surface))`,
      }}
    >
      <div className="dot-grid absolute inset-0 opacity-30" />
      <div className="relative h-[8.6rem] w-[4.7rem] translate-y-6 rounded-[14px] border border-white/20 bg-background/85 p-1.5 shadow-[0_18px_40px_-14px_rgb(0_0_0/0.55)] backdrop-blur transition-transform duration-500 group-hover:translate-y-3 group-hover:-rotate-3">
        <div
          className="grid h-8 place-items-center rounded-lg font-display text-[13px] font-semibold text-white"
          style={{ backgroundImage: `linear-gradient(135deg, oklch(0.6 0.2 ${h}), oklch(0.5 0.22 ${(h + 70) % 360}))` }}
        >
          {project.isApkAnalysis ? <Package className="size-4" /> : initialsOf(project.name)}
        </div>
        <div className="mt-1.5 grid gap-1">
          <i className="h-1.5 w-full rounded-full bg-foreground/15" />
          <i className="h-1.5 w-3/4 rounded-full bg-foreground/10" />
          <i className="h-5 w-full rounded-md bg-foreground/[0.07]" />
          <i className="h-5 w-full rounded-md bg-foreground/[0.07]" />
        </div>
      </div>
    </div>
  );
}

/** Small square thumbnail used by the list view. */
export function ProjectThumb({ project, className }: { project: Project; className?: string }) {
  const h = hueOf(project.id);
  return (
    <span
      aria-hidden
      className={cn("grid size-10 shrink-0 place-items-center rounded-xl font-display text-[13px] font-semibold text-white shadow-[0_6px_16px_-8px_rgb(0_0_0/0.5)]", className)}
      style={{ backgroundImage: `linear-gradient(135deg, oklch(0.62 0.2 ${h}), oklch(0.5 0.22 ${(h + 70) % 360}))` }}
    >
      {project.isApkAnalysis ? <Package className="size-4" /> : initialsOf(project.name)}
    </span>
  );
}
