import { render, screen, within } from '@testing-library/react';
import { expect, it } from 'vitest';

import { IconInfoCircle } from '@ui/icon/components/TablerIcons';
import { THEME_DARK } from '@ui/theme/constants/ThemeDark';
import { THEME_LIGHT } from '@ui/theme/constants/ThemeLight';
import { themeCssVariables } from '@ui/theme/themeCssVariables';
import { ThemeProvider } from '@ui/theme/ThemeProvider';
import { useTheme } from '@ui/theme/useTheme';

const ThemeSizedIcon = () => {
  const theme = useTheme();

  return (
    <>
      <IconInfoCircle
        role="img"
        aria-label="Info"
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
      />
      <output aria-label="Font color">{theme.font.color.primary}</output>
    </>
  );
};

const expectNumericIconWithHostColor = () => {
  const icon = screen.getByRole('img', { name: 'Info' });

  expect(icon).toHaveAttribute('width', '16');
  expect(icon).toHaveAttribute('height', '16');
  expect(icon).toHaveAttribute('stroke-width', '1.6');
  expect(screen.getByLabelText('Font color')).toHaveTextContent(
    themeCssVariables.font.color.primary,
  );
};

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

it('gives icons numeric sizes without a provider', () => {
  render(<ThemeSizedIcon />);

  expectNumericIconWithHostColor();
});

it('gives icons numeric sizes when theme CSS variables cannot be read', () => {
  render(
    <ThemeProvider colorScheme="light" applyToRoot={false}>
      <ThemeSizedIcon />
    </ThemeProvider>,
  );

  expectNumericIconWithHostColor();
});

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
