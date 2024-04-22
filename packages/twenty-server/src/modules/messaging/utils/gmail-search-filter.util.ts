export const gmailSearchFilterNonPersonalEmails =
  '*noreply@|*no-reply@|*do_not_reply@|*no.reply@|*info@|*contact@|*hello@|*support@|*feedback@|*service@|*help@';

export const gmailSearchFilterExcludeEmailAdresses = (
  emails?: string[],
): string => {
  if (!emails || emails.length === 0) {
    return `from:-(${gmailSearchFilterNonPersonalEmails}) -category:promotions -category:social -category:forums -filename:.ics`;
  }

  return `(in:inbox from:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )})|(in:sent to:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )})) -category:promotions -category:social -category:forums -filename:.ics`;
};

export const gmailSearchFilterIncludeOnlyEmailAdresses = (
  emails?: string[],
): string | undefined => {
  if (!emails || emails.length === 0) {
    return undefined;
  }

  return `(in:inbox from:(${emails.join('|')})|(in:sent to:(${emails.join(
    '|',
  )}))`;
};

export const gmailSearchFilterEmailAdresses = (
  includedEmails?: string[] | undefined,
  excludedEmails?: string[] | undefined,
): string | undefined => {
  if (!includedEmails || includedEmails.length === 0) {
    return gmailSearchFilterExcludeEmailAdresses(excludedEmails);
  }

  if (!excludedEmails || excludedEmails.length === 0) {
    return gmailSearchFilterIncludeOnlyEmailAdresses(includedEmails);
  }

  return `(in:inbox from:((${includedEmails.join(
    '|',
  )}) -(${gmailSearchFilterNonPersonalEmails}|${excludedEmails.join(
    '|',
  )}))|(in:sent to:((${includedEmails.join(
    '|',
  )}) -(${gmailSearchFilterNonPersonalEmails}|${excludedEmails.join('|')}))`;
};
