export function safeDecodeURIComponent(str: string, fallback = ""): string {
  try { return decodeURIComponent(str); } catch { return fallback || str; }
}