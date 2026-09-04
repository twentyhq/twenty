export function truncateMiddleString(str: string, lead = 6, trail = 4): string {
  if (str.length <= lead + trail + 3) return str;
  return `${str.slice(0, lead)}...${str.slice(-trail)}`;
}