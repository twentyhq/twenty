import { MemoryRouter } from 'react-router-dom';
import { Decorator } from '@storybook/react';

export const RouterDecorator: Decorator = (Story) => (
  <MemoryRouter>
    <Story />
  </MemoryRouter>
);
