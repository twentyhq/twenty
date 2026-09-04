export function parseSemanticVersion(v: string): { major: number; minor: number; patch: number } {
  const match = v.replace(/^v/, "").match(/^(\d+)\.(\d+)\.(\d+)/);
  if (!match) return { major: 0, minor: 0, patch: 0 };
  return { major: parseInt(match[1], 10), minor: parseInt(match[2], 10), patch: parseInt(match[3], 10) };
}