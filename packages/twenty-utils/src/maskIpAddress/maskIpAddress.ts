export function maskIpAddress(ip: string): string {
  if (ip.includes(".")) {
    const p = ip.split("."); return p.length === 4 ? `${p[0]}.${p[1]}.${p[2]}.0` : ip;
  }
  return ip.includes(":") ? ip.split(":").slice(0, 3).join(":") + "::" : ip;
}