const DATE_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function formatArticleDate(date: Date | string): string {
  const resolved = typeof date === 'string' ? new Date(date) : date;

  if (Number.isNaN(resolved.getTime())) {
    throw new Error(`Invalid article date: ${String(date)}`);
  }

  return DATE_FORMATTER.format(resolved);
}
