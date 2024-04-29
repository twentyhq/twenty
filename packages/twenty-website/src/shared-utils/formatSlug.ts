export function formatSlug(slug: string): string {
  return slug
    .split('-')
    .map((word: string) => word?.charAt(0)?.toUpperCase?.() + word?.slice?.(1))
    .join(' ');
}
