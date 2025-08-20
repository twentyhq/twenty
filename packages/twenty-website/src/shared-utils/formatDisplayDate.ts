export const formatGithubPublishedAtDisplayDate = (
  dateString: string,
): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const now = new Date();
  const isCurrentYear = date.getFullYear() === now.getFullYear();

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: isCurrentYear ? 'long' : 'short',
    day: 'numeric',
    ...(isCurrentYear ? {} : { year: 'numeric' }),
  });

  return formatter.format(date);
};
