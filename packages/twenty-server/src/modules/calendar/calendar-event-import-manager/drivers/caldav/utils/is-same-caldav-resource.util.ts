import { isDefined } from 'twenty-shared/utils';

export const isSameCalDavResource = (
  href: string,
  otherHref: string,
): boolean => {
  const resolvedHref = URL.parse(href, otherHref);
  const resolvedOtherHref = URL.parse(otherHref);

  if (!isDefined(resolvedHref) || !isDefined(resolvedOtherHref)) {
    return false;
  }

  return (
    resolvedHref.origin === resolvedOtherHref.origin &&
    resolvedHref.pathname.replace(/\/+$/, '') ===
      resolvedOtherHref.pathname.replace(/\/+$/, '')
  );
};
