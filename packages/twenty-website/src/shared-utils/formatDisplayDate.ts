export const formatGithubPublishedAtDisplayDate = (
  dateString: string,
): string => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return '';

  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month}, ${year}`;
};
