import { type Preview } from '@storybook/react-vite';
import '@ui/theme-constants/theme-light.css';
import '@ui/theme-constants/theme-dark.css';
import { ColorSchemeProvider } from '@ui/theme';

const preview: Preview = {
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return (
        <ColorSchemeProvider colorScheme="light">
          <Story />
        </ColorSchemeProvider>
      );
    },
  ],
};

export default preview;
