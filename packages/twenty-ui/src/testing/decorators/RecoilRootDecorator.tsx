import { type Decorator } from '@storybook/react';

import { RecoilRoot } from 'recoil';

export const RecoilRootDecorator: Decorator = (Story, _context) => (
  <RecoilRoot>
    <Story />
  </RecoilRoot>
);
