export function safeJsonParse<T>(json: string, fallback: T): T {
  try { return JSON.parse(json); } catch { return fallback; }
}