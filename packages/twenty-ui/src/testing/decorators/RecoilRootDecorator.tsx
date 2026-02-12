import { type Decorator } from '@storybook/react-vite';

import { Provider as JotaiProvider } from 'jotai';

// Kept as RecoilRootDecorator name for backward compatibility during migration
export const RecoilRootDecorator: Decorator = (Story, _context) => (
  <JotaiProvider>
    <Story />
  </JotaiProvider>
);
