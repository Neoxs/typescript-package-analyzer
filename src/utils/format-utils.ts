/**
 * Formats a number of bytes to a human-readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

/**
 * Formats milliseconds to a human-readable string
 */
export function formatTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = (ms / 1000).toFixed(2);
  if (Number(seconds) < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(ms / (1000 * 60));
  const remainingSeconds = ((ms % (1000 * 60)) / 1000).toFixed(1);
  return `${minutes}m ${remainingSeconds}s`;
}

/**
 * Gets relative time string (e.g., "2 months ago")
 */
export function getRelativeTimeString(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffMonth / 12);

  if (diffYear > 0) return `${diffYear} year${diffYear > 1 ? "s" : ""} ago`;
  if (diffMonth > 0) return `${diffMonth} month${diffMonth > 1 ? "s" : ""} ago`;
  if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
  if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  return "Just now";
}

/**
 * Formats author information from package.json
 */
export function formatAuthor(author: any): string {
  if (!author) return "Not specified";

  if (typeof author === "string") return author;

  if (typeof author === "object") {
    let authorStr = author.name || "";
    if (author.email) authorStr += ` <${author.email}>`;
    if (author.url) authorStr += ` (${author.url})`;
    return authorStr;
  }

  return "Not specified";
}
