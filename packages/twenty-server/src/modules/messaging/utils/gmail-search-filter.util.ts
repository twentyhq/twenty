export const gmailSearchFilterNonPersonalEmails =
  '*noreply@|*no-reply@|*do_not_reply@|*no.reply@|*info@|*contact@|*hello@|*support@|*feedback@|*service@|*help@';

export const gmailSearchFilterExcludeEmails = (emails: string[]): string => {
  if (emails.length === 0) {
    return `from:-(${gmailSearchFilterNonPersonalEmails}) -category:promotions -category:social -category:forums -filename:.ics`;
  }

  return `(in:inbox from:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )})|(in:sent to:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )})) -category:promotions -category:social -category:forums -filename:.ics`;
};
