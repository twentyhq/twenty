import React from 'react';
import { ThemeProvider } from '@emotion/react';
import { Preview } from '@storybook/react';

import { THEME_LIGHT } from '../src/theme/index';

const preview: Preview = {
  // TODO: Add toggle for darkTheme.
  decorators: [
    (Story) => (
      <ThemeProvider theme={THEME_LIGHT}>
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
