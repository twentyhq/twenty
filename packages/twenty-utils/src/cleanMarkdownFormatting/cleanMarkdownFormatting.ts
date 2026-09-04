export function cleanMarkdownFormatting(md: string): string {
  return md.replace(/(\*\*|__)(.*?)\1/g, "$2").replace(/(\*|_)(.*?)\1/g, "$2").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1").replace(/^#+\s+/gm, "").trim();
}