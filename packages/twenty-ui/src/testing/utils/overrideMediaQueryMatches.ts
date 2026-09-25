import { isFunction } from '@sniptt/guards';

import { isDefined } from '@ui/utilities/utils/isDefined';

const createStaticMediaQueryList = (query: string): MediaQueryList =>
  Object.assign(new EventTarget(), {
    media: query,
    matches: false,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
  });

export const overrideMediaQueryMatches = (
  matchesByQuery: Partial<Record<string, boolean>>,
) => {
  const originalMatchMedia = window.matchMedia;

  window.matchMedia = (query: string) => {
    const mediaQueryList = isFunction(originalMatchMedia)
      ? originalMatchMedia.call(window, query)
      : createStaticMediaQueryList(query);
    const overriddenMatches = matchesByQuery[query];

    if (!isDefined(overriddenMatches)) {
      return mediaQueryList;
    }

    Object.defineProperty(mediaQueryList, 'matches', {
      value: overriddenMatches,
    });

    return mediaQueryList;
  };

  return () => {
    window.matchMedia = originalMatchMedia;
  };
};
