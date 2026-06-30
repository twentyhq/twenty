import { type Parameters } from '@storybook/react-vite';

export const A11Y_DEFER_COLOR_CONTRAST = {
  test: 'error',
  config: { rules: [{ id: 'color-contrast', enabled: false }] },
} satisfies Parameters['a11y'];
