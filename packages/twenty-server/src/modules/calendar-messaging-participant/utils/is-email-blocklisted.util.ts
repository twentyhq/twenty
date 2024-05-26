export const isEmailBlocklisted = (
  email: string | null | undefined,
  blocklist: string[],
): boolean => {
  if (!email) {
    return false;
  }

  return blocklist.some((item) => {
    if (item.startsWith('@')) {
      return email.endsWith(item);
    }

    return email === item;
  });
};
