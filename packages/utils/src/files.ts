/**
 * Format a file size in bytes to human-readable string.
 * Example: 1048576 → "1.0 MB"
 */
export function formatFileSize(bytes: number | bigint | string): string {
  const numBytes = typeof bytes === "string" ? parseInt(bytes, 10) : Number(bytes);

  if (numBytes === 0) return "0 B";
  if (isNaN(numBytes)) return "—";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(numBytes) / Math.log(1024));
  const size = numBytes / Math.pow(1024, i);

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

/**
 * Get file extension from filename.
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

/**
 * Get file type icon name based on MIME type or extension.
 */
export function getFileTypeIcon(
  fileType: string
): "file-text" | "file-image" | "file-spreadsheet" | "file" | "file-code" {
  if (fileType.startsWith("image/")) return "file-image";
  if (fileType.includes("pdf")) return "file-text";
  if (fileType.includes("spreadsheet") || fileType.includes("excel") || fileType.includes("xlsx") || fileType.includes("csv")) return "file-spreadsheet";
  if (fileType.includes("dwg") || fileType.includes("dxf") || fileType.includes("autocad")) return "file-code";
  if (fileType.includes("text") || fileType.includes("document") || fileType.includes("word") || fileType.includes("docx")) return "file-text";
  return "file";
}

/**
 * Allowed MIME types for document uploads.
 */
export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/tiff",
  "application/zip",
  "application/x-zip-compressed",
  "text/plain",
  "text/csv",
] as const;

/**
 * Max file size: 100MB.
 */
export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;

/**
 * Max file size for bid submission attachments: 25MB.
 */
export const MAX_SUBMISSION_FILE_SIZE_BYTES = 25 * 1024 * 1024;

/**
 * Max number of files per bid submission.
 */
export const MAX_SUBMISSION_FILES = 10;

/**
 * Validate a file's MIME type is in the allowed list.
 */
export function isAllowedMimeType(mimeType: string): boolean {
  return (ALLOWED_DOCUMENT_MIME_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Generate a storage path for a document.
 */
export function generateStoragePath(
  organizationId: string,
  projectId: string,
  filename: string
): string {
  const timestamp = Date.now();
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${organizationId}/${projectId}/${timestamp}_${sanitized}`;
}