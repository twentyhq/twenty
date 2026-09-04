export function maskSensitiveString(str: string, keep = 4): string {
  if (str.length <= keep) return str;
  return "*".repeat(str.length - keep) + str.slice(-keep);
}