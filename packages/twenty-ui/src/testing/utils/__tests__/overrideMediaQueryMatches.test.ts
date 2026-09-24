import { afterEach, describe, expect, it, vi } from 'vitest';

import { overrideMediaQueryMatches } from '@ui/testing/utils/overrideMediaQueryMatches';

const createNativeMatchMedia = () =>
  vi.fn(
    (query: string) =>
      ({
        media: query,
        matches: false,
      }) as MediaQueryList,
  );

afterEach(() => {
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
