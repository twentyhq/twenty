import { type Decorator } from '@storybook/react-vite';
import { MemoryRouter } from 'react-router-dom';

export const RouterDecorator: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);
