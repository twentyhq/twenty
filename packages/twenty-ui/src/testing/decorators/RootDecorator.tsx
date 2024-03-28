import { Decorator } from '@storybook/react';
import { RecoilRoot } from 'recoil';

export const RootDecorator: Decorator = (Story) => (
  <RecoilRoot>
    <Story />
  </RecoilRoot>
);
