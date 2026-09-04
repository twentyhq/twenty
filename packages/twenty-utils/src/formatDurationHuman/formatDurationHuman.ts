export function formatDurationHuman(ms: number): string {
  const sec = Math.floor(ms / 1000), min = Math.floor(sec / 60), hrs = Math.floor(min / 60);
  if (hrs > 0) return `${hrs}h ${min % 60}m`;
  if (min > 0) return `${min}m ${sec % 60}s`;
  return `${sec}s`;
}