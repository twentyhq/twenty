export const isSameCalDavResource = (
  href: string,
  otherHref: string,
): boolean => {
  const resolvedHref = new URL(href, otherHref);
  const resolvedOtherHref = new URL(otherHref);

  return (
    resolvedHref.origin === resolvedOtherHref.origin &&
    resolvedHref.pathname.replace(/\/+$/, '') ===
      resolvedOtherHref.pathname.replace(/\/+$/, '')
  );
};
