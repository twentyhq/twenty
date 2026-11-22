// A route made readable: '/' is Home, '/partners/creators' is
// "Partners · Creators", '/*' the layout every page shares.
export const pageLabel = (route: string) =>
  route === '/'
    ? 'Home'
    : route === '/*'
      ? 'Every page (layout)'
      : route
          .slice(1)
          .split('/')
          .map((segment) =>
            segment
              .split('-')
              .map((word) =>
                word.startsWith('[')
                  ? word
                  : word.charAt(0).toUpperCase() + word.slice(1),
              )
              .join(' '),
          )
          .join(' · ');
