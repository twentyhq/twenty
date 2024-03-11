import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { Preview } from '@storybook/react';

import { lightTheme } from '../src/theme/index';

const preview: Preview = {
  // TODO: Add toggle for darkTheme.
  decorators: [
    (Story) => (
      <ThemeProvider theme={lightTheme}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
