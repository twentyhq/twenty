export const googleCalendarSearchFilterExcludeEmails = (
  emails: string[],
): string | undefined => {
  if (emails.length === 0) {
    return undefined;
  }

  return `-(${emails.join(', ')})`;
};
