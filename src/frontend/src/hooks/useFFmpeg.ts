import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { useRef, useState } from "react";
import type { ProcessingOptions, ProcessingStatus } from "../types";

export function useFFmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [status, setStatus] = useState<ProcessingStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [outputBlob, setOutputBlob] = useState<Blob | null>(null);
  const [outputSize, setOutputSize] = useState(0);

  async function loadFFmpeg(): Promise<FFmpeg> {
    if (ffmpegRef.current) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    ffmpeg.on("progress", ({ progress: p }) => {
      setProgress(Math.min(99, Math.round(p * 100)));
    });
    ffmpeg.on("log", ({ message }) => {
      if (message.includes("frame=") || message.includes("speed=")) {
        setStatusMessage("Encoding video...");
      }
    });
    setStatusMessage("Loading ffmpeg engine...");
    await ffmpeg.load({
      coreURL: await toBlobURL(
        "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js",
        "text/javascript",
      ),
      wasmURL: await toBlobURL(
        "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm",
        "application/wasm",
      ),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }

  async function processVideo(file: File, options: ProcessingOptions) {
    setStatus("loading");
    setProgress(0);
    setOutputBlob(null);
    setOutputSize(0);
    setStatusMessage("");

    try {
      const ffmpeg = await loadFFmpeg();
      setStatus("processing");
      setStatusMessage("Preparing video...");

      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const inputName = `input.${ext}`;
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      setStatusMessage("Processing video...");

      const args: string[] = ["-i", inputName];

      if (options.metadataRemoval) {
        args.push("-map_metadata", "-1");
      }

      if (options.compress) {
        // Re-encode with ultrafast preset for maximum speed in WebAssembly
        args.push("-c:v", "libx264", "-c:a", "aac");
        switch (options.compressionLevel) {
          case "low":
            args.push("-crf", "18", "-preset", "ultrafast");
            break;
          case "medium":
            args.push("-crf", "23", "-preset", "ultrafast");
            break;
          case "high":
            args.push(
              "-crf",
              "28",
              "-preset",
              "ultrafast",
              "-vf",
              "scale=trunc(iw*3/8)*2:trunc(ih*3/8)*2",
            );
            break;
        }
      } else {
        // No compression: stream copy MP4 (instant) or remux other formats
        if (ext === "mp4") {
          args.push("-c", "copy");
        } else {
          args.push(
            "-c:v",
            "libx264",
            "-crf",
            "18",
            "-preset",
            "ultrafast",
            "-c:a",
            "aac",
          );
        }
      }

      args.push("-movflags", "+faststart", outputName);

      await ffmpeg.exec(args);

      setStatusMessage("Finalizing...");
      const data = await ffmpeg.readFile(outputName);

      let blobPart: ArrayBuffer | string;
      if (data instanceof Uint8Array) {
        const copy = new Uint8Array(data.byteLength);
        copy.set(data);
        blobPart = copy.buffer;
      } else {
        blobPart = data as string;
      }
      const blob = new Blob([blobPart], { type: "video/mp4" });

      setOutputBlob(blob);
      setOutputSize(blob.size);
      setProgress(100);
      setStatus("done");
      setStatusMessage("Processing complete!");

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `optimized_${file.name.replace(/\.[^/.]+$/, "")}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 15000);

      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});
    } catch (err) {
      console.error("FFmpeg error:", err);
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setStatus("error");
      setStatusMessage(msg);
    }
  }

  function reset() {
    setStatus("idle");
    setProgress(0);
    setStatusMessage("");
    setOutputBlob(null);
    setOutputSize(0);
  }

  return {
    status,
    progress,
    statusMessage,
    outputBlob,
    outputSize,
    processVideo,
    reset,
  };
}
