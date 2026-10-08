import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { THEME_DARK } from '@ui/theme/constants/ThemeDark';
import { THEME_LIGHT } from '@ui/theme/constants/ThemeLight';
import { ThemeProvider } from '@ui/theme/ThemeProvider';
import { useTheme } from '@ui/theme/useTheme';

const SpacingReadout = () => {
  const theme = useTheme();

  return (
    <>
      <output aria-label="Spacing">{theme.spacing[3]}</output>
      <output aria-label="Half spacing">{theme.spacing['0.5']}</output>
      <output aria-label="Font color">{theme.font.color.primary}</output>
    </>
  );
};

it('exposes spacing entries when given static theme values', () => {
  render(
    <ThemeProvider colorScheme="dark" applyToRoot={false} theme={THEME_DARK}>
      <SpacingReadout />
    </ThemeProvider>,
  );

  expect(screen.getByLabelText('Spacing')).toHaveTextContent('12px');
  expect(screen.getByLabelText('Half spacing')).toHaveTextContent('2px');
  expect(screen.getByLabelText('Font color')).toHaveTextContent(
    THEME_DARK.font.color.primary,
  );
});

it('keeps explicit theme values inside nested providers', () => {
  render(
    <ThemeProvider colorScheme="dark" applyToRoot={false} theme={THEME_DARK}>
      <ThemeProvider
        colorScheme="dark"
        applyToRoot={false}
        overrides={{ '--t-font-color-primary': '#ededed' }}
      >
        <section aria-label="Inherited theme">
          <SpacingReadout />
        </section>
      </ThemeProvider>
      <ThemeProvider
        colorScheme="light"
        applyToRoot={false}
        theme={THEME_LIGHT}
      >
        <section aria-label="Replaced theme">
          <SpacingReadout />
        </section>
      </ThemeProvider>
    </ThemeProvider>,
  );

  const inheritedTheme = within(
    screen.getByRole('region', { name: 'Inherited theme' }),
  );
  const replacedTheme = within(
    screen.getByRole('region', { name: 'Replaced theme' }),
  );

  expect(inheritedTheme.getByLabelText('Spacing')).toHaveTextContent('12px');
  expect(inheritedTheme.getByLabelText('Font color')).toHaveTextContent(
    THEME_DARK.font.color.primary,
  );
  expect(replacedTheme.getByLabelText('Font color')).toHaveTextContent(
    THEME_LIGHT.font.color.primary,
  );
});
