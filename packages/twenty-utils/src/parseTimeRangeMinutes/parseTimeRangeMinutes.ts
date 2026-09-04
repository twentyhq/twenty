export function parseTimeRangeMinutes(rangeStr: string): { start: number; end: number } | null {
  const [s, e] = rangeStr.split("-"); if (!s || !e) return null;
  function toMin(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }
  return { start: toMin(s.trim()), end: toMin(e.trim()) };
}