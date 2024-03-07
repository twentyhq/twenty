export const googleCalendarSearchFilterExcludeEmails = (
  emails: string[],
): string => {
  if (emails.length === 0) {
    return '';
  }

  return `email=-${emails.join(', -')}`;
};
