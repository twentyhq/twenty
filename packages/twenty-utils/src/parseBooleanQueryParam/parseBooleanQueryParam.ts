export function parseBooleanQueryParam(val: any, defaultVal = false): boolean {
  if (val === undefined || val === null) return defaultVal;
  const s = String(val).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(s)) return true;
  if (["false", "0", "no", "off"].includes(s)) return false;
  return defaultVal;
}