export function sanitizeDomainName(input: string): string {
  return input.toLowerCase().trim().replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0].split(":")[0];
}