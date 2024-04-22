export const gmailSearchFilterNonPersonalEmails =
  'noreply|no-reply|do_not_reply|no.reply|accounts@|info@|admin@|contact@|hello@|support@|sales@|feedback@|service@|help@|mailer-daemon|notifications|digest|auto|apps|assign|comments|customer-success|enterprise|esign|express|forum|gc@|learn|mailer|marketing|messages|news|notification|payments|receipts|recrutement|security|service|support|team';

export const gmailSearchFilterExcludeEmails = (emails: string[]): string => {
  if (emails.length === 0) {
    return `from:-(${gmailSearchFilterNonPersonalEmails}`;
  }

  return `(in:inbox from:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )})|(in:sent to:-(${gmailSearchFilterNonPersonalEmails}|${emails.join(
    '|',
  )}))`;
};
