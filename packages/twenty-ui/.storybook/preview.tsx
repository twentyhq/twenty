import { useEffect } from 'react';
import { ThemeProvider } from '@emotion/react';
import { Preview } from '@storybook/react';
import { useDarkMode } from 'storybook-dark-mode';

import {
  THEME_DARK,
  THEME_LIGHT,
  ThemeContextProvider,
} from '../src/theme/index';

const preview: Preview = {
  decorators: [
    (Story) => {
      const mode = useDarkMode() ? 'Dark' : 'Light';

      const theme = mode === 'Dark' ? THEME_DARK : THEME_LIGHT;

      useEffect(() => {
        document.documentElement.className = mode === 'Dark' ? 'dark' : 'light';
      }, [mode]);

      return (
        <ThemeProvider theme={theme}>
          <ThemeContextProvider theme={theme}>
            <Story />
          </ThemeContextProvider>
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
