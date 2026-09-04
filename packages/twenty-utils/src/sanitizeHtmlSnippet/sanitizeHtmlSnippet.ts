export function sanitizeHtmlSnippet(html: string): string {
  const allowed = ["b", "i", "strong", "em", "p", "br", "a", "ul", "ol", "li", "code"];
  return html.replace(/<\/?([a-z0-9]+)(?:\s+[^>]*)?>/gi, (match, tag) => {
    return allowed.includes(tag.toLowerCase()) ? match.replace(/\son\w+="[^"]*"/gi, "") : "";
  });
}