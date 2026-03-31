import { AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { HeroSection } from "./components/HeroSection";
import { Navbar } from "./components/Navbar";
import { OptionsPanel } from "./components/OptionsPanel";
import { ProcessingPanel } from "./components/ProcessingPanel";
import { ResultsPanel } from "./components/ResultsPanel";
import { UploadZone } from "./components/UploadZone";
import { useFFmpeg } from "./hooks/useFFmpeg";
import type { ProcessingOptions, VideoFileInfo } from "./types";

const DEFAULT_OPTIONS: ProcessingOptions = {
  metadataRemoval: true,
  compress: true,
  compressionLevel: "medium",
  outputFormat: "mp4",
};

export default function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("videoopt-dark");
    return stored !== null ? stored === "true" : true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("videoopt-dark", String(darkMode));
  }, [darkMode]);

  const [fileInfo, setFileInfo] = useState<VideoFileInfo | null>(null);
  const [options, setOptions] = useState<ProcessingOptions>(DEFAULT_OPTIONS);
  const inputRef = useRef<HTMLInputElement>(null!);

  const {
    status,
    progress,
    statusMessage,
    outputBlob,
    outputSize,
    processVideo,
    reset,
  } = useFFmpeg();

  const handleUploadClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleFile = useCallback(
    (info: VideoFileInfo) => {
      setFileInfo(info);
      reset();
    },
    [reset],
  );

  const handleClear = useCallback(() => {
    if (fileInfo) URL.revokeObjectURL(fileInfo.url);
    setFileInfo(null);
    reset();
    if (inputRef.current) inputRef.current.value = "";
  }, [fileInfo, reset]);

  const handleProcess = useCallback(() => {
    if (!fileInfo) return;
    processVideo(fileInfo.file, options);
  }, [fileInfo, options, processVideo]);

  const handleReset = useCallback(() => {
    handleClear();
  }, [handleClear]);

  const isProcessing = status === "loading" || status === "processing";
  const isDone = status === "done" || status === "error";

  return (
    <div className="min-h-screen bg-background">
      <Navbar darkMode={darkMode} onToggleDark={() => setDarkMode((d) => !d)} />

      <main>
        {/* Hero */}
        {!fileInfo && status === "idle" && (
          <HeroSection onUploadClick={handleUploadClick} />
        )}

        {/* App area */}
        <div className="mx-auto max-w-6xl px-6 pb-24">
          {/* Upload + options side by side */}
          {!isDone && (
            <div className="grid gap-6 md:grid-cols-[1fr_360px]">
              <UploadZone
                fileInfo={fileInfo}
                onFile={handleFile}
                onClear={handleClear}
                inputRef={inputRef}
              />
              <OptionsPanel
                options={options}
                onChange={setOptions}
                onProcess={handleProcess}
                canProcess={!!fileInfo}
                isProcessing={isProcessing}
              />
            </div>
          )}

          {/* Processing panel */}
          <AnimatePresence>
            {isProcessing && (
              <div className="mt-6">
                <ProcessingPanel
                  status={status}
                  progress={progress}
                  statusMessage={statusMessage}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Results / error panel */}
          <AnimatePresence>
            {isDone && (
              <div className="mt-6">
                <ResultsPanel
                  status={status}
                  originalSize={fileInfo?.size ?? 0}
                  outputSize={outputSize}
                  outputBlob={outputBlob}
                  filename={fileInfo?.name ?? "video"}
                  errorMessage={statusMessage}
                  onReset={handleReset}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="transition-colors hover:text-primary"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
