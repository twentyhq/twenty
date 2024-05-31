export const isPersonEmail = (email: string): boolean => {
  const nonPersonalPattern =
    /noreply|no-reply|do_not_reply|no\.reply|^(info@|contact@|hello@|support@|feedback@|service@|help@)/;

  return !nonPersonalPattern.test(email);
};
