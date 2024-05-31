export const isSectionPath = (pathname: string | undefined): boolean => {
  return !!(
    pathname &&
    (pathname.startsWith('/developers/section') ||
      pathname.startsWith('/user-guide/section'))
  );
};

export const isDocsSection = (pathname: string | undefined): boolean => {
  return isSectionPath(pathname) && pathname?.split('/').length === 4;
};

export const isPlaygroundPage = (pathname: string | undefined): boolean => {
  return !!(
    pathname &&
    (pathname.startsWith('/developers/rest-api') ||
      pathname.startsWith('/developers/graphql'))
  );
};

export const shouldShowEmptySidebar = (
  pathname: string | undefined,
): boolean => {
  return (
    pathname === '/user-guide' ||
    pathname === '/developers' ||
    isDocsSection(pathname) ||
    isPlaygroundPage(pathname)
  );
};
