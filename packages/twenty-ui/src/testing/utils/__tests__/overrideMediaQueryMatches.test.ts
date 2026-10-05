import { cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { overrideMediaQueryMatches } from '@ui/testing/utils/overrideMediaQueryMatches';
import { MOBILE_MEDIA_QUERY } from '@ui/utilities/responsive/constants/MobileMediaQuery';
import { useIsMobile } from '@ui/utilities/responsive/hooks/useIsMobile';

const createNativeMatchMedia = () =>
  vi.fn(
    (query: string) =>
      ({
        media: query,
        matches: false,
      }) as MediaQueryList,
  );

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('overrideMediaQueryMatches', () => {
  it('forces listed queries and passes other queries through', () => {
    const nativeMatchMedia = createNativeMatchMedia();
    vi.stubGlobal('matchMedia', nativeMatchMedia);

    overrideMediaQueryMatches({ '(max-width: 768px)': true });

    expect(window.matchMedia('(max-width: 768px)').matches).toBe(true);
    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(
      false,
    );
    expect(nativeMatchMedia).toHaveBeenCalledTimes(2);
  });

  it('forces listed queries when the environment has no matchMedia', () => {
    vi.stubGlobal('matchMedia', undefined);

    overrideMediaQueryMatches({ [MOBILE_MEDIA_QUERY]: true });

    expect(renderHook(useIsMobile).result.current).toBe(true);
    expect(window.matchMedia('(prefers-color-scheme: dark)').matches).toBe(
      false,
    );
  });

  it('restores the native matchMedia on cleanup', () => {
    const nativeMatchMedia = createNativeMatchMedia();
    vi.stubGlobal('matchMedia', nativeMatchMedia);

    const restoreMatchMedia = overrideMediaQueryMatches({
      '(max-width: 768px)': true,
    });
    restoreMatchMedia();

    expect(window.matchMedia).toBe(nativeMatchMedia);
    expect(window.matchMedia('(max-width: 768px)').matches).toBe(false);
  });
});
