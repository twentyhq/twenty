// '/' is the home page, '/*' the layout every page shares.
export const toPageSlug = (route: string) =>
  route === '/'
    ? 'home'
    : route === '/*'
      ? 'layout'
      : route.slice(1).replace(/[[\]]/g, '').replaceAll('/', '-');
