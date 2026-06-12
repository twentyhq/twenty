import { type Decorator } from '@storybook/react-vite';

import { Provider as JotaiProvider } from 'jotai';

export const JotaiRootDecorator: Decorator = (Story) => (
  <JotaiProvider>
    <Story />
  </JotaiProvider>
);
