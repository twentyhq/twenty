import { ThemeProvider } from '@emotion/react';
import { type Preview } from '@storybook/react';
import { THEME_LIGHT, ThemeContextProvider } from '@ui/theme';

const preview: Preview = {
  decorators: [
    (Story) => {
      // const mode = useDarkMode() ? 'Dark' : 'Light';

      const theme = THEME_LIGHT;

    /*  useEffect(() => {
        document.documentElement.className = mode === 'Dark' ? 'dark' : 'light';
      }, [mode]);*/

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
