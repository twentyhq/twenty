export function validatePostalCode(postal: string, country = "US"): boolean {
  const clean = postal.trim();
  if (country === "US") return /^\d{5}(-\d{4})?$/.test(clean);
  if (country === "CA") return /^[A-Z]\d[A-Z] \d[A-Z]\d$/i.test(clean);
  return clean.length >= 3 && clean.length <= 10;
}