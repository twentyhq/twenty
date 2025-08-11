export const formatGithubPublishedAtDisplayDate = (
  dateString: string,
): string => {
  const date = new Date(dateString);

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return formatter.format(date);
};
