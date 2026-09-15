import { getDomainFromEmail } from 'src/utils/get-domain-from-email';

export const isEmailBlocklisted = (
  channelHandle: string[],
  email: string | null | undefined,
  blocklist: string[],
): boolean => {
  if (!email || channelHandle.includes(email)) {
    return false;
  }

  const domain = getDomainFromEmail(email);

  return blocklist.some((item) => {
    if (item.startsWith('@')) {
      const bareDomain = item.slice(1);

      return (
        domain === bareDomain || (domain?.endsWith(`.${bareDomain}`) ?? false)
      );
    }

    return email === item;
  });
};
