import { render } from '@testing-library/react';

import { ThemeProvider, type ThemeType } from '../ThemeProvider';
import { themeCssVariables } from '../themeCssVariables';
import { useTheme } from '../useTheme';

const readInlineScale = () =>
  document.documentElement.style.getPropertyValue('--t-scale-user');

const renderProvider = (scale?: number) =>
  render(
    <ThemeProvider colorScheme="light" scale={scale}>
      <div />
    </ThemeProvider>,
  );

describe('ThemeProvider scale', () => {
  afterEach(() => {
    document.documentElement.style.removeProperty('--t-scale-user');
  });

  it('should write the scale onto the root element', () => {
    renderProvider(1.25);

    expect(readInlineScale()).toBe('1.25');
  });

  it('should update the scale on rerender', () => {
    const { rerender } = renderProvider(1.1);
    expect(readInlineScale()).toBe('1.1');

    rerender(
      <ThemeProvider colorScheme="light" scale={0.9}>
        <div />
      </ThemeProvider>,
    );

    expect(readInlineScale()).toBe('0.9');
  });

  it('should remove the scale from the root element on unmount', () => {
    const { unmount } = renderProvider(1.25);
    expect(readInlineScale()).toBe('1.25');

    unmount();

    expect(readInlineScale()).toBe('');
  });

  it('should remove the scale when the scale prop goes back to undefined', () => {
    const { rerender } = renderProvider(1.25);
    expect(readInlineScale()).toBe('1.25');

    rerender(
      <ThemeProvider colorScheme="light">
        <div />
      </ThemeProvider>,
    );

    expect(readInlineScale()).toBe('');
  });

  it('should ignore the scale on a scoped provider', () => {
    render(
      <ThemeProvider colorScheme="light" overrides={{}} scale={1.25}>
        <div />
      </ThemeProvider>,
    );

    expect(readInlineScale()).toBe('');
  });

  it('should not remove a scale another provider set when mounted without one', () => {
    document.documentElement.style.setProperty('--t-scale-user', '1.25');

    const { unmount } = renderProvider();
    expect(readInlineScale()).toBe('1.25');

    unmount();

    expect(readInlineScale()).toBe('1.25');
  });
});

describe('ThemeProvider token resolution', () => {
  let latestTheme: ThemeType | undefined;

  const ThemeSpy = () => {
    latestTheme = useTheme();
    return null;
  };

  beforeEach(() => {
    latestTheme = undefined;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // jsdom never applies theme-light.css / theme-dark.css (CSS imports are
  // mocked out in Jest), so getComputedStyle().getPropertyValue('--t-...')
  // returns '' for every design token here, the same failure mode as the
  // front-component sandbox described in issue #24052.
  it('falls back to the original CSS variable reference when a token cannot be resolved', () => {
    render(
      <ThemeProvider colorScheme="light">
        <ThemeSpy />
      </ThemeProvider>,
    );

    expect(latestTheme?.icon.size.md).toBe(themeCssVariables.icon.size.md);
    expect(latestTheme?.font.color.primary).toBe(
      themeCssVariables.font.color.primary,
    );
  });

  it('still resolves numeric CSS variables that are readable, alongside unresolved ones', () => {
    jest.spyOn(window, 'getComputedStyle').mockReturnValue({
      getPropertyValue: (property: string) =>
        property === '--t-icon-size-md' ? '16' : '',
    } as CSSStyleDeclaration);

    render(
      <ThemeProvider colorScheme="light">
        <ThemeSpy />
      </ThemeProvider>,
    );

    expect(latestTheme?.icon.size.md).toBe(16);
    expect(latestTheme?.icon.size.sm).toBe(themeCssVariables.icon.size.sm);
  });
});
