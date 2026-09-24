import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

export const isEmailBlocklisted = (
  channelHandle: string[],
  email: string | null | undefined,
  blocklist: string[],
): boolean => {
  if (!email) {
    return false;
  }

  const normalizedEmail = email.toLowerCase();

  if (
    channelHandle.some((handle) => handle.toLowerCase() === normalizedEmail)
  ) {
    return false;
  }

  const domain = getDomainFromEmail(normalizedEmail);

  return blocklist.some((rawItem) => {
    const item = rawItem.toLowerCase();

    if (item.startsWith('@')) {
      const bareDomain = item.slice(1);

      return (
        domain === bareDomain || (domain?.endsWith(`.${bareDomain}`) ?? false)
      );
    }

    return normalizedEmail === item;
  });
};
