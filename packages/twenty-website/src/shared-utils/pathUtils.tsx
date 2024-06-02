export const startsWithAny = (
  pathname: string,
  prefixes: string[],
): boolean => {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
};

export const isSectionPath = (pathname: string | undefined): boolean => {
  if (!pathname) return false;
  return startsWithAny(pathname, [
    '/developers/section',
    '/user-guide/section',
    '/twenty-ui/section',
  ]);
};

export const isDocsSection = (pathname: string | undefined): boolean => {
  return isSectionPath(pathname) && pathname?.split('/').length === 4;
};

export const isPlaygroundPage = (pathname: string | undefined): boolean => {
  if (!pathname) return false;
  return startsWithAny(pathname, [
    '/developers/rest-api',
    '/developers/graphql',
  ]);
};

export const shouldShowEmptySidebar = (
  pathname: string | undefined,
): boolean => {
  if (!pathname) return false;
  return (
    ['/user-guide', '/developers', '/twenty-ui'].includes(pathname) ||
    isDocsSection(pathname) ||
    isPlaygroundPage(pathname)
  );
};

export const getUriAndLabel = (pathname: string) => {
  if (pathname.includes('user-guide')) {
    return { uri: '/user-guide', label: 'User Guide' };
  }
  if (pathname.includes('developers')) {
    return { uri: '/developers', label: 'Developers' };
  }
  return { uri: '/twenty-ui', label: 'UI Components' };
};
