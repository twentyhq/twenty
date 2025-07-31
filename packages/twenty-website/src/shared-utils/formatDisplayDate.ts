export const formatGithubPublishedAtDisplayDate = (
  dateString: string,
): string => {
  const date = new Date(dateString);
  const currentYear = new Date().getFullYear();

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(date.getFullYear() !== currentYear && { year: 'numeric' }),
  });

  return formatter.format(date);
};
