"use client";

import { cn } from "@/lib/utils";
import type { AgentStatus } from "@/types";

const STATUS_CONFIG: Record<AgentStatus, { color: string; pulse: boolean; label: string }> = {
  IDLE: { color: "bg-muted-foreground", pulse: false, label: "Idle" },
  RUNNING: { color: "bg-[var(--color-positive)]", pulse: true, label: "Running" },
  ERROR: { color: "bg-[var(--color-negative)]", pulse: false, label: "Error" },
  DISABLED: { color: "bg-muted-foreground/50", pulse: false, label: "Disabled" },
};

export function AgentStatusDot({ status, showLabel = false }: { status: AgentStatus; showLabel?: boolean }) {
  const config = STATUS_CONFIG[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", config.color, config.pulse && "animate-pulse")} />
      {showLabel && (
        <span className="font-mono-terminal text-[10px] uppercase tracking-wider text-muted-foreground">
          {config.label}
        </span>
      )}
    </span>
  );
}
