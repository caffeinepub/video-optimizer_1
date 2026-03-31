import { Download, RotateCcw, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import type { ProcessingStatus } from "../types";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

interface ResultsPanelProps {
  status: ProcessingStatus;
  originalSize: number;
  outputSize: number;
  outputBlob: Blob | null;
  filename: string;
  errorMessage?: string;
  onReset: () => void;
}

export function ResultsPanel({
  status,
  originalSize,
  outputSize,
  outputBlob,
  filename,
  errorMessage,
  onReset,
}: ResultsPanelProps) {
  if (status !== "done" && status !== "error") return null;

  if (status === "error") {
    return (
      <motion.div
        data-ocid="results.error_state"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full rounded-2xl border border-destructive/30 bg-destructive/10 p-6"
      >
        <p className="font-semibold text-destructive">Processing Failed</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {errorMessage ||
            "An error occurred during processing. Please try again with a different file."}
        </p>
        <button
          type="button"
          data-ocid="results.cancel_button"
          onClick={onReset}
          className="mt-4 flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary/50"
        >
          <RotateCcw className="h-4 w-4" /> Try Again
        </button>
      </motion.div>
    );
  }

  const reduction =
    originalSize > 0
      ? Math.round(((originalSize - outputSize) / originalSize) * 100)
      : 0;

  function handleDownload() {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `optimized_${filename.replace(/\.[^/.]+$/, "")}.mp4`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 15000);
  }

  return (
    <motion.div
      data-ocid="results.panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-border bg-card p-6"
    >
      <div className="mb-5 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Processing Complete</h3>
        {reduction > 0 && (
          <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
            <TrendingDown className="h-3.5 w-3.5" />
            {reduction}% smaller
          </span>
        )}
      </div>

      {/* Before / After */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-secondary/40 p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Original
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatSize(originalSize)}
          </p>
        </div>
        <div className="rounded-xl border border-primary/30 bg-primary/10 p-4 glow-teal">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-primary">
            Optimized
          </p>
          <p className="text-xl font-bold text-primary">
            {formatSize(outputSize)}
          </p>
        </div>
      </div>

      {/* Download */}
      <motion.button
        type="button"
        data-ocid="results.primary_button"
        onClick={handleDownload}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 0 32px oklch(0.75 0.18 185 / 0.45)",
        }}
        whileTap={{ scale: 0.97 }}
        className="gradient-teal shadow-glow mb-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold text-white"
      >
        <Download className="h-4 w-4" /> Download Video
      </motion.button>

      <button
        type="button"
        data-ocid="results.secondary_button"
        onClick={onReset}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <RotateCcw className="h-4 w-4" /> Process Another Video
      </button>
    </motion.div>
  );
}
