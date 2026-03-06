import { type Preview } from '@storybook/react-vite';
import '@ui/theme-constants/theme-light.css';
import '@ui/theme-constants/theme-dark.css';
import { ThemeProvider } from '@ui/theme-constants';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return (
        <ThemeProvider colorScheme="light">
          <Story />
        </ThemeProvider>
      );
    },
  ],
};

export default preview;
