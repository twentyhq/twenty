export const gmailSearchFilterNonPersonalEmails =
  '*noreply@|*no-reply@|*do_not_reply@|*no.reply@|*info@|*contact@|*hello@|*support@|*feedback@|*service@|*help@';

export const excludedCategories = ['promotions', 'social', 'forums'];

export const excludedFileTypes = ['.ics'];

export const excludedCategoriesAndFileTypesString = `-category:${excludedCategories.join(
  ' -category:',
)} -filename:${excludedFileTypes.join(' -filename:')}`;

export const gmailSearchFilterExcludeEmailAdresses = (
  emails?: string[],
): string => {
  if (!emails || emails.length === 0) {
    return `from:-(${gmailSearchFilterNonPersonalEmails}) ${excludedCategoriesAndFileTypesString}`;
  }

  return `(in:inbox from:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )})|(in:sent to:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )})) ${excludedCategoriesAndFileTypesString}`;
};

export const gmailSearchFilterIncludeOnlyEmailAdresses = (
  emails?: string[],
): string | undefined => {
  if (!emails || emails.length === 0) {
    return undefined;
  }

  return `(in:inbox from:(${emails.join('|')})|(in:sent to:(${emails.join(
    '|',
  )})) ${excludedCategoriesAndFileTypesString}`;
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
  )}) -(${gmailSearchFilterNonPersonalEmails}|${excludedEmails.join(
    '|',
  )})) ${excludedCategoriesAndFileTypesString}`;
};
