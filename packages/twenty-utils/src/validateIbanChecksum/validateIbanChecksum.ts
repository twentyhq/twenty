export function validateIbanChecksum(iban: string): boolean {
  const clean = iban.replace(/\s/g, "").toUpperCase();
  if (clean.length < 15 || clean.length > 34) return false;
  const rearranged = clean.slice(4) + clean.slice(0, 4);
  let numStr = "";
  for (const c of rearranged) numStr += c >= "A" && c <= "Z" ? (c.charCodeAt(0) - 55) : c;
  let remainder = 0n;
  for (let i = 0; i < numStr.length; i += 7) {
    remainder = BigInt(String(remainder) + numStr.slice(i, i + 7)) % 97n;
  }
  return remainder === 1n;
}