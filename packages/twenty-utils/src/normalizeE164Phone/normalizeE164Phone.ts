export function normalizeE164Phone(raw: string, defaultCountry = "US"): string | null {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 10 && defaultCountry === "US") return "+1" + digits;
  if (digits.length === 11 && digits.startsWith("1")) return "+" + digits;
  if (digits.length >= 10 && digits.length <= 15) return "+" + digits;
  return null;
}