import { ThemeProvider } from '@emotion/react';
import { withThemeFromJSXProvider } from '@storybook/addon-themes';
import { Preview, ReactRenderer } from '@storybook/react';

import { THEME_DARK, THEME_LIGHT } from '../src/theme/index';

const preview: Preview = {
  // TODO: Add toggle for darkTheme.
  decorators: [
    withThemeFromJSXProvider<ReactRenderer>({
      themes: {
        light: THEME_LIGHT,
        dark: THEME_DARK,
      },
      defaultTheme: 'light',
      Provider: ThemeProvider,
    }),
  ],
};

export default preview;
