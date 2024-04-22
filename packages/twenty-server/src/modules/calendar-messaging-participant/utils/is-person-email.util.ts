export const isPersonEmail = (email: string | undefined): boolean => {
  if (!email) return false;

  const nonPersonalPattern =
    /noreply|no-reply|do_not_reply|no\.reply|^(accounts@|info@|admin@|contact@|hello@|support@|sales@|feedback@|service@|help@|mailer-daemon|notifications?|digest|auto|apps|assign|comments|customer-success|enterprise|esign|express|forum|gc@|learn|mailer|marketing|messages|news|notification|payments|receipts|recrutement|security|service|support|team)/;

  return !nonPersonalPattern.test(email);
};
