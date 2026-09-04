export function validateVatNumber(vat: string): boolean {
  const clean = vat.replace(/[\s.-]/g, "").toUpperCase();
  return /^[A-Z]{2}[A-Z0-9]{2,12}$/.test(clean);
}