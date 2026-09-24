import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { THEME_DARK } from '@ui/theme/constants/ThemeDark';
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
