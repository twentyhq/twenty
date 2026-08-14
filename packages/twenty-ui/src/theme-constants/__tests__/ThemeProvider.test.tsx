import { act, render, screen } from '@testing-library/react';
import { useContext } from 'react';

import { MOBILE_VIEWPORT } from '../constants';
import { ThemeContext, ThemeProvider } from '../ThemeProvider';

const DESKTOP_ICON_SIZE_MD = '16';
const MOBILE_ICON_SIZE_MD = '18';

const IconSizeProbe = () => {
  const { theme } = useContext(ThemeContext);

  return <span data-testid="icon-size-md">{theme.icon.size.md}</span>;
};

// The theme CSS gives --t-icon-size-md a different value below the breakpoint.
// jsdom does not apply media queries, so the test plays the part of the
// stylesheet and sets the value the provider should read on each side.
const setIconSizeMd = (value: string) => {
  document.documentElement.style.setProperty('--t-icon-size-md', value);
};

// jsdom ships no matchMedia, so there is nothing to spy on and it has to be
// defined outright. defineProperty rather than assignment because Window types
// it as required, which leaves no way to put the absence back afterwards.
const setMatchMedia = (matchMedia: Window['matchMedia'] | undefined) => {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: matchMedia,
  });
};

const stubMatchMedia = () => {
  const changeListeners: EventListener[] = [];

  const addEventListener = jest.fn((_type: string, listener: EventListener) => {
    changeListeners.push(listener);
  });
  const removeEventListener = jest.fn();

  const mediaQueryList: MediaQueryList = {
    matches: false,
    media: '',
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener,
    removeEventListener,
    dispatchEvent: () => false,
  };

  const matchMedia = jest.fn(() => mediaQueryList);

  setMatchMedia(matchMedia);

  return {
    matchMedia,
    addEventListener,
    removeEventListener,
    crossBreakpoint: () => {
      act(() => {
        for (const listener of changeListeners) {
          listener(new Event('change'));
        }
      });
    },
  };
};

const renderProvider = () =>
  render(
    <ThemeProvider colorScheme="light">
      <IconSizeProbe />
    </ThemeProvider>,
  );

const readIconSizeMd = () => screen.getByTestId('icon-size-md').textContent;

describe('ThemeProvider', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--t-icon-size-md');
    setMatchMedia(undefined);
  });

  it('should derive the theme from the CSS variables on mount', () => {
    setIconSizeMd(DESKTOP_ICON_SIZE_MD);
    stubMatchMedia();

    renderProvider();

    expect(readIconSizeMd()).toBe(DESKTOP_ICON_SIZE_MD);
  });

  it('should watch the mobile breakpoint', () => {
    setIconSizeMd(DESKTOP_ICON_SIZE_MD);
    const { matchMedia, addEventListener } = stubMatchMedia();

    renderProvider();

    expect(matchMedia).toHaveBeenCalledWith(
      `(max-width: ${MOBILE_VIEWPORT}px)`,
    );
    expect(addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('should recompute the theme when the viewport crosses the breakpoint', () => {
    setIconSizeMd(DESKTOP_ICON_SIZE_MD);
    const { crossBreakpoint } = stubMatchMedia();

    renderProvider();
    expect(readIconSizeMd()).toBe(DESKTOP_ICON_SIZE_MD);

    setIconSizeMd(MOBILE_ICON_SIZE_MD);
    crossBreakpoint();

    expect(readIconSizeMd()).toBe(MOBILE_ICON_SIZE_MD);
  });

  it('should stop watching the breakpoint on unmount', () => {
    setIconSizeMd(DESKTOP_ICON_SIZE_MD);
    const { removeEventListener } = stubMatchMedia();

    const { unmount } = renderProvider();
    unmount();

    expect(removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function),
    );
  });

  it('should render without a matchMedia implementation', () => {
    setIconSizeMd(DESKTOP_ICON_SIZE_MD);

    renderProvider();

    expect(readIconSizeMd()).toBe(DESKTOP_ICON_SIZE_MD);
  });
});
