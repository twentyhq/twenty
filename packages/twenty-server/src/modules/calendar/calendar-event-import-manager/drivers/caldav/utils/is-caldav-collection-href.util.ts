export const isCalDavCollectionHref = (
  href: string,
  collectionUrl: string,
): boolean => {
  const resolvedHref = new URL(href, collectionUrl);
  const resolvedCollectionUrl = new URL(collectionUrl);

  return (
    resolvedHref.origin === resolvedCollectionUrl.origin &&
    resolvedHref.pathname.replace(/\/+$/, '') ===
      resolvedCollectionUrl.pathname.replace(/\/+$/, '')
  );
};
