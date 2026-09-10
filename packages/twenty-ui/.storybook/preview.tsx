import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';

import { type Preview } from '@storybook/react-vite';
import '@ui/theme-constants/theme-light.css';
import '@ui/theme-constants/theme-dark.css';
import { ThemeProvider } from '@ui/theme-constants';

const preview: Preview = {
  tags: ['autodocs'],
  parameters: {
    a11y: {
      test: 'error',
    },
  },
  globalTypes: {
    colorScheme: {
      description: 'Color scheme applied by ThemeProvider',
      toolbar: {
        title: 'Color scheme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorScheme: 'light',
  },
  decorators: [
    (Story, context) => {
      const colorScheme =
        context.globals.colorScheme === 'dark' ? 'dark' : 'light';

      return (
        <ThemeProvider colorScheme={colorScheme}>
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
