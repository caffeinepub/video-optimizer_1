import { AlertTriangle, FileVideo, Upload, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useState } from "react";
import type { VideoFileInfo } from "../types";

const ACCEPTED = [".mp4", ".mov", ".avi", ".mkv"];
const ACCEPTED_MIME = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
];
const MAX_SIZE_WARN = 500 * 1024 * 1024; // 500 MB

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      resolve(video.duration);
      URL.revokeObjectURL(url);
    };
    video.onerror = () => resolve(0);
    video.src = url;
  });
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface UploadZoneProps {
  fileInfo: VideoFileInfo | null;
  onFile: (info: VideoFileInfo) => void;
  onClear: () => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export function UploadZone({
  fileInfo,
  onFile,
  onClear,
  inputRef,
}: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sizeWarn, setSizeWarn] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      setSizeWarn(false);
      const ext = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!ACCEPTED.includes(ext) && !ACCEPTED_MIME.includes(file.type)) {
        setError("Unsupported format. Please use MP4, MOV, AVI, or MKV.");
        return;
      }
      if (file.size > MAX_SIZE_WARN) setSizeWarn(true);
      const duration = await getVideoDuration(file);
      const url = URL.createObjectURL(file);
      onFile({ file, name: file.name, size: file.size, duration, url });
    },
    [onFile],
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <motion.div
        data-ocid="upload.dropzone"
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !fileInfo && inputRef.current?.click()}
        animate={dragging ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative min-h-[260px] cursor-pointer rounded-2xl transition-all ${
          fileInfo ? "cursor-default" : ""
        } ${
          dragging
            ? "border-2 border-solid border-primary bg-primary/5 glow-teal"
            : "teal-glow-border"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".mp4,.mov,.avi,.mkv"
          className="hidden"
          onChange={onInputChange}
          data-ocid="upload.input"
        />

        <AnimatePresence mode="wait">
          {fileInfo ? (
            <motion.div
              key="file-info"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex h-full min-h-[260px] flex-col items-center justify-center gap-4 p-8"
            >
              <div className="gradient-teal rounded-2xl p-4 shadow-glow">
                <FileVideo className="h-8 w-8 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">{fileInfo.name}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatSize(fileInfo.size)}
                  {fileInfo.duration > 0 &&
                    ` • ${formatDuration(fileInfo.duration)}`}
                </p>
              </div>
              <button
                type="button"
                data-ocid="upload.delete_button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" /> Remove
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full min-h-[260px] flex-col items-center justify-center gap-5 p-8"
            >
              <div
                className={`rounded-2xl p-5 ${dragging ? "gradient-teal" : "border border-border bg-secondary"}`}
              >
                <Upload
                  className={`h-8 w-8 ${dragging ? "text-white" : "text-muted-foreground"}`}
                />
              </div>
              <div className="text-center">
                <p className="font-semibold text-foreground">
                  {dragging ? "Drop your video here" : "Drag & drop your video"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse files
                </p>
              </div>
              {/* Format chips */}
              <div className="flex flex-wrap justify-center gap-2">
                {["MP4", "MOV", "AVI", "MKV"].map((f) => (
                  <span
                    key={f}
                    className="rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary"
                  >
                    {f}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Warnings & errors */}
      <AnimatePresence>
        {sizeWarn && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-2 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-400"
          >
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Large file detected – processing may be slow.
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            data-ocid="upload.error_state"
            className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm text-destructive"
          >
            <X className="h-4 w-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
