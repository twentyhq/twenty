import { type Meta, type StoryObj } from '@storybook/react';

import {
  AVATAR_URL_MOCK,
  ComponentDecorator,
  RecoilRootDecorator,
} from '@ui/testing';

import { Avatar } from '../Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Modules/Users/Avatar',
  component: Avatar,
  decorators: [ComponentDecorator, RecoilRootDecorator],
  args: {
    avatarUrl: AVATAR_URL_MOCK,
    size: 'md',
    placeholder: 'E',
    type: 'rounded',
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Rounded: Story = {};

export const Squared: Story = {
  args: { type: 'squared' },
};

export const NoAvatarPictureRounded: Story = {
  args: { avatarUrl: '' },
};

export const NoAvatarPictureSquared: Story = {
  args: {
    ...NoAvatarPictureRounded.args,
    ...Squared.args,
  },
};
