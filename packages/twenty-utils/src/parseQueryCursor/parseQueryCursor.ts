export function encodeCursor(data: Record<string, any>): string {
  return Buffer.from(JSON.stringify(data)).toString("base64url");
}
export function decodeCursor<T = any>(cursor: string): T | null {
  try { return JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")); } catch { return null; }
}