export const isEmailBlocklisted = (
  email: string | null | undefined,
  blocklist: string[],
): boolean => {
  if (!email) {
    return false;
  }

  return blocklist.some((item) => {
    if (item.startsWith('@')) {
      const domain = email.split('@')[1];

      return domain === item.slice(1) || domain.endsWith(`.${item.slice(1)}`);
    }

    return email === item;
  });
};
