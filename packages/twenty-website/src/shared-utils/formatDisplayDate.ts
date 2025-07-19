export const formatGithubPublishedAtDisplayDate = (
  dateString: string,
): string => {
  const currentYear = new Date().getFullYear().toString();

  let formattedDate = dateString;
  if (dateString.endsWith(currentYear)) {
    formattedDate = dateString.slice(0, -5);
  }

  formattedDate = formattedDate
    .replace(/^January\s/, 'Jan ')
    .replace(/^February\s/, 'Feb ')
    .replace(/^March\s/, 'Mar ')
    .replace(/^April\s/, 'Apr ')
    .replace(/^May\s/, 'May ')
    .replace(/^June\s/, 'Jun ')
    .replace(/^July\s/, 'Jul ')
    .replace(/^August\s/, 'Aug ')
    .replace(/^September\s/, 'Sep ')
    .replace(/^October\s/, 'Oct ')
    .replace(/^November\s/, 'Nov ')
    .replace(/^December\s/, 'Dec ');

  return formattedDate;
};
