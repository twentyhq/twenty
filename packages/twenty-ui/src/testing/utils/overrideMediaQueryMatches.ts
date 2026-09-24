import { isDefined } from '@ui/utilities/utils/isDefined';

export const overrideMediaQueryMatches = (
  matchesByQuery: Partial<Record<string, boolean>>,
) => {
  const originalMatchMedia = window.matchMedia;

  window.matchMedia = (query: string) => {
    const mediaQueryList = originalMatchMedia.call(window, query);
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
