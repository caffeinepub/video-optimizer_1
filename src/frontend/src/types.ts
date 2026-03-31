export type ProcessingStatus =
  | "idle"
  | "loading"
  | "processing"
  | "done"
  | "error";

export type CompressionLevel = "low" | "medium" | "high";

export interface ProcessingOptions {
  metadataRemoval: boolean;
  compress: boolean;
  compressionLevel: CompressionLevel;
  outputFormat: "mp4";
}

export interface VideoFileInfo {
  file: File;
  name: string;
  size: number;
  duration: number;
  url: string;
}
