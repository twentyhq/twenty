import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { AVATAR_URL_MOCK, ComponentDecorator } from '@ui/testing';

import { Avatar } from '@ui/data-display/Avatar/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'UI/Data Display/Avatar',
  component: Avatar,
  decorators: [ComponentDecorator],
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

export const App: Story = {
  args: {
    type: 'app',
    avatarUrl: '',
    placeholder: 'Acme',
    placeholderColorSeed: 'acme-app',
  },
};

export const ImageFailingToLoadFallsBackToPlaceholder: Story = {
  args: {
    avatarUrl: 'data:image/png;base64,not-a-valid-image',
    placeholder: 'Eldritch',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const placeholderChar = await canvas.findByText('E');

    await expect(placeholderChar).toBeVisible();
  },
};
