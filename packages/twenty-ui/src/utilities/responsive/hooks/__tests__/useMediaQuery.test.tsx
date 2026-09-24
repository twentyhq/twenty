import { act, cleanup, renderHook } from '@testing-library/react';
import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { MOBILE_MEDIA_QUERY } from '@ui/utilities/responsive/constants/MobileMediaQuery';
import { TOUCH_DEVICE_MEDIA_QUERY } from '@ui/utilities/responsive/constants/TouchDeviceMediaQuery';
import { useIsMobile } from '@ui/utilities/responsive/hooks/useIsMobile';
import { useIsTouchDevice } from '@ui/utilities/responsive/hooks/useIsTouchDevice';
import { useMediaQuery } from '../useMediaQuery';

const createMediaQueryList = ({
  media,
  matches = false,
}: {
  media: string;
  matches?: boolean;
}) => {
  const target = new EventTarget();
  const mediaQueryList = {
    media,
    matches,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(target.addEventListener.bind(target)),
    removeEventListener: vi.fn(target.removeEventListener.bind(target)),
    dispatchEvent: target.dispatchEvent.bind(target),
  } satisfies MediaQueryList;

  return {
    mediaQueryList,
    setMatches: (nextMatches: boolean) => {
      mediaQueryList.matches = nextMatches;
      target.dispatchEvent(new Event('change'));
    },
  };
};

const useResponsiveState = () => ({
  isMobile: useIsMobile(),
  isTouchDevice: useIsTouchDevice(),
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('responsive media queries', () => {
  it('reads initial matches and updates viewport and input capability independently', () => {
    const mobile = createMediaQueryList({
      media: MOBILE_MEDIA_QUERY,
      matches: true,
    });
    const touch = createMediaQueryList({ media: TOUCH_DEVICE_MEDIA_QUERY });
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) =>
        query === MOBILE_MEDIA_QUERY
          ? mobile.mediaQueryList
          : touch.mediaQueryList,
      ),
    );
    const { result } = renderHook(useResponsiveState);

    expect(window.matchMedia).toHaveBeenCalledWith(MOBILE_MEDIA_QUERY);
    expect(window.matchMedia).toHaveBeenCalledWith(TOUCH_DEVICE_MEDIA_QUERY);
    expect(result.current).toEqual({ isMobile: true, isTouchDevice: false });
    act(() => {
      mobile.setMatches(false);
      touch.setMatches(true);
    });
    expect(result.current).toEqual({ isMobile: false, isTouchDevice: true });
    act(() => touch.setMatches(false));
    expect(result.current).toEqual({ isMobile: false, isTouchDevice: false });
  });

  it('replaces the subscription when the query changes and cleans up on unmount', () => {
    const mobile = createMediaQueryList({ media: MOBILE_MEDIA_QUERY });
    const touch = createMediaQueryList({
      media: TOUCH_DEVICE_MEDIA_QUERY,
      matches: true,
    });
    vi.stubGlobal('matchMedia', (query: string) =>
      query === MOBILE_MEDIA_QUERY
        ? mobile.mediaQueryList
        : touch.mediaQueryList,
    );
    const { result, rerender, unmount } = renderHook(
      (query: string) => useMediaQuery(query),
      { initialProps: MOBILE_MEDIA_QUERY, wrapper: StrictMode },
    );
    expect(result.current).toBe(false);
    rerender(TOUCH_DEVICE_MEDIA_QUERY);
    expect(result.current).toBe(true);
    act(() => mobile.setMatches(true));
    expect(result.current).toBe(true);
    unmount();

    for (const { mediaQueryList } of [mobile, touch]) {
      expect(mediaQueryList.removeEventListener.mock.calls).toEqual(
        mediaQueryList.addEventListener.mock.calls,
      );
    }
  });

  it('rechecks a query changed between render and subscription', () => {
    const { mediaQueryList } = createMediaQueryList({
      media: MOBILE_MEDIA_QUERY,
    });
    mediaQueryList.addEventListener.mockImplementation(() => {
      mediaQueryList.matches = true;
    });
    vi.stubGlobal('matchMedia', () => mediaQueryList);
    const { result } = renderHook(useIsMobile);
    expect(result.current).toBe(true);
  });

  it('shares one media query list per query across mounted hooks', () => {
    const mobile = createMediaQueryList({ media: MOBILE_MEDIA_QUERY });
    const matchMedia = vi.fn(() => mobile.mediaQueryList);
    vi.stubGlobal('matchMedia', matchMedia);
    const first = renderHook(useIsMobile);
    const second = renderHook(useIsMobile);

    expect(matchMedia).toHaveBeenCalledTimes(1);
    act(() => mobile.setMatches(true));
    expect([first.result.current, second.result.current]).toEqual([true, true]);
  });

  it('reads a replaced matchMedia implementation instead of the cached list', () => {
    const desktop = createMediaQueryList({ media: MOBILE_MEDIA_QUERY });
    vi.stubGlobal('matchMedia', () => desktop.mediaQueryList);
    const { unmount } = renderHook(useIsMobile);
    unmount();

    const mobile = createMediaQueryList({
      media: MOBILE_MEDIA_QUERY,
      matches: true,
    });
    vi.stubGlobal('matchMedia', () => mobile.mediaQueryList);
    const { result } = renderHook(useIsMobile);

    expect(result.current).toBe(true);
  });

  it('returns false without matchMedia, regardless of viewport width', () => {
    vi.stubGlobal('matchMedia', undefined);
    vi.stubGlobal('innerWidth', 375);
    const { result } = renderHook(useResponsiveState);
    expect(result.current).toEqual({ isMobile: false, isTouchDevice: false });
  });

  it('uses the server snapshot even when native queries match', () => {
    const { mediaQueryList } = createMediaQueryList({
      media: MOBILE_MEDIA_QUERY,
      matches: true,
    });
    vi.stubGlobal('matchMedia', () => mediaQueryList);
    const ResponsiveState = () => <output>{String(useIsMobile())}</output>;

    expect(renderToString(<ResponsiveState />)).toBe('<output>false</output>');
    expect(mediaQueryList.addEventListener).not.toHaveBeenCalled();
  });

  it('renders on the server without window and hydrates before reading client matches', async () => {
    const snapshots: ReturnType<typeof useResponsiveState>[] = [];
    const ResponsiveState = () => {
      const state = useResponsiveState();
      snapshots.push(state);
      return <output>{JSON.stringify(state)}</output>;
    };
    vi.stubGlobal('window', undefined);
    const html = renderToString(<ResponsiveState />);
    vi.unstubAllGlobals();
    expect(snapshots).toEqual([{ isMobile: false, isTouchDevice: false }]);

    const mobile = createMediaQueryList({
      media: MOBILE_MEDIA_QUERY,
      matches: true,
    });
    const touch = createMediaQueryList({
      media: TOUCH_DEVICE_MEDIA_QUERY,
      matches: true,
    });
    vi.stubGlobal('matchMedia', (query: string) =>
      query === MOBILE_MEDIA_QUERY
        ? mobile.mediaQueryList
        : touch.mediaQueryList,
    );
    const container = document.createElement('div');
    container.innerHTML = html;
    const onRecoverableError = vi.fn();
    const root = await act(() =>
      hydrateRoot(container, <ResponsiveState />, { onRecoverableError }),
    );
    expect(snapshots[1]).toEqual({ isMobile: false, isTouchDevice: false });
    expect(container.textContent).toBe(
      JSON.stringify({ isMobile: true, isTouchDevice: true }),
    );
    expect(onRecoverableError).not.toHaveBeenCalled();
    await act(() => root.unmount());
    for (const { mediaQueryList } of [mobile, touch]) {
      expect(mediaQueryList.removeEventListener.mock.calls).toEqual(
        mediaQueryList.addEventListener.mock.calls,
      );
    }
  });
});
