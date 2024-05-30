// utils/pathUtils.ts
export const isSectionPath = (pathname: string | undefined): boolean => {
  return !!(
    pathname &&
    (pathname.startsWith('/docs/section') ||
      pathname.startsWith('/user-guide/section'))
  );
};

export const isDocsSection = (pathname: string | undefined): boolean => {
  return isSectionPath(pathname) && pathname?.split('/').length === 4;
};

export const isPlaygroundPage = (pathname: string | undefined): boolean => {
  return !!(
    pathname &&
    (pathname.startsWith('/docs/rest-api') ||
      pathname.startsWith('/docs/graphql'))
  );
};

export const shouldShowEmptySidebar = (
  pathname: string | undefined,
): boolean => {
  return (
    pathname === '/user-guide' ||
    pathname === '/docs' ||
    isDocsSection(pathname) ||
    isPlaygroundPage(pathname)
  );
};
