import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CompressionLevel, ProcessingOptions } from "../types";

interface OptionsPanelProps {
  options: ProcessingOptions;
  onChange: (opts: ProcessingOptions) => void;
  onProcess: () => void;
  canProcess: boolean;
  isProcessing: boolean;
}

export function OptionsPanel({
  options,
  onChange,
  onProcess,
  canProcess,
  isProcessing,
}: OptionsPanelProps) {
  const levels: { value: CompressionLevel; label: string; desc: string }[] = [
    { value: "low", label: "Low", desc: "High quality" },
    { value: "medium", label: "Med", desc: "Balanced" },
    { value: "high", label: "High", desc: "Smallest" },
  ];

  return (
    <div className="flex flex-col gap-5 rounded-2xl border border-border bg-card p-6">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        Processing Options
      </h2>

      {/* Toggle: AI Deep Clean */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label className="text-sm font-medium text-foreground">
            AI Deep Clean & Metadata Removal
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Strips all digital fingerprints & metadata
          </p>
        </div>
        <Switch
          data-ocid="options.toggle"
          checked={options.metadataRemoval}
          onCheckedChange={(v) => onChange({ ...options, metadataRemoval: v })}
          className="data-[state=checked]:bg-primary shrink-0"
        />
      </div>

      <div className="h-px bg-border" />

      {/* Toggle: Compress */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Label className="text-sm font-medium text-foreground">
            Optimize & Compress Video
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Reduce file size with H.264 encoding
          </p>
        </div>
        <Switch
          data-ocid="options.compress_toggle"
          checked={options.compress}
          onCheckedChange={(v) => onChange({ ...options, compress: v })}
          className="data-[state=checked]:bg-primary shrink-0"
        />
      </div>

      {/* Compression level */}
      <AnimatePresence>
        {options.compress && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-3 rounded-xl bg-secondary/50 p-4">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Compression Level
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {levels.map(({ value, label, desc }) => (
                  <button
                    type="button"
                    key={value}
                    data-ocid={`options.${value}.button`}
                    onClick={() =>
                      onChange({ ...options, compressionLevel: value })
                    }
                    className={`flex flex-col items-center rounded-xl border py-3 text-center transition-all ${
                      options.compressionLevel === value
                        ? "border-primary/60 bg-primary/15 text-primary shadow-glow"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    <span className="text-sm font-semibold">{label}</span>
                    <span className="mt-0.5 text-[10px]">{desc}</span>
                  </button>
                ))}
              </div>

              {/* Output format */}
              <div className="mt-1">
                <Label className="mb-2 block text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Output Format
                </Label>
                <div
                  data-ocid="options.select"
                  className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground"
                >
                  <span>MP4</span>
                  <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    Default
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-px bg-border" />

      {/* Process button */}
      <motion.button
        type="button"
        data-ocid="options.submit_button"
        onClick={onProcess}
        disabled={!canProcess || isProcessing}
        whileHover={
          canProcess && !isProcessing
            ? { scale: 1.02, boxShadow: "0 0 28px oklch(0.75 0.18 185 / 0.4)" }
            : {}
        }
        whileTap={canProcess && !isProcessing ? { scale: 0.97 } : {}}
        className={`w-full rounded-xl py-3.5 text-sm font-semibold transition-all ${
          canProcess && !isProcessing
            ? "gradient-teal cursor-pointer text-white shadow-glow"
            : "cursor-not-allowed bg-muted text-muted-foreground"
        }`}
      >
        {isProcessing ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing...
          </span>
        ) : (
          "Process Video"
        )}
      </motion.button>
    </div>
  );
}
