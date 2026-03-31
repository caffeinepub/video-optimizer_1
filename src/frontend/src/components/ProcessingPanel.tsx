import { motion } from "motion/react";
import type { ProcessingStatus } from "../types";

interface ProcessingPanelProps {
  status: ProcessingStatus;
  progress: number;
  statusMessage: string;
}

export function ProcessingPanel({
  status,
  progress,
  statusMessage,
}: ProcessingPanelProps) {
  if (status !== "loading" && status !== "processing") return null;

  const label =
    status === "loading"
      ? "Loading ffmpeg engine..."
      : statusMessage || "Processing video...";
  const displayProgress = status === "loading" ? null : progress;

  return (
    <motion.div
      data-ocid="processing.panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="w-full rounded-2xl border border-border bg-card p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        {displayProgress !== null && (
          <span className="text-sm font-bold text-primary">
            {displayProgress}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {displayProgress !== null ? (
          <motion.div
            className="h-full rounded-full gradient-teal"
            initial={{ width: "0%" }}
            animate={{ width: `${displayProgress}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        ) : (
          // Indeterminate shimmer — single style source, no conflicting class
          <div
            className="h-full w-1/3 rounded-full animate-shimmer"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, oklch(0.75 0.18 185 / 0.8) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
            }}
          />
        )}
      </div>

      {status === "loading" && (
        <p className="mt-3 text-xs text-muted-foreground">
          Downloading WebAssembly engine (~30 MB). This only happens once per
          session.
        </p>
      )}
    </motion.div>
  );
}
