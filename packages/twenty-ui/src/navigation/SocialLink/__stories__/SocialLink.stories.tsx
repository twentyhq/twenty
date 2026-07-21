import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ComponentWithRouterDecorator } from '@ui/testing';
import { LinkType } from '@ui/navigation/SocialLink/LinkType';
import { SocialLink } from '@ui/navigation/SocialLink/SocialLink';

const meta: Meta<typeof SocialLink> = {
  title: 'UI/Navigation/Link/SocialLink',
  component: SocialLink,
  decorators: [ComponentWithRouterDecorator],
  args: {
    href: 'https://twenty.com',
  },
};

export default meta;
type Story = StoryObj<typeof SocialLink>;
const clickJestFn = fn();

export const LinkedIn: Story = {
  args: {
    href: 'https://www.linkedin.com/in/johndoe',
    onClick: clickJestFn,
    type: LinkType.LinkedIn,
  },
};

export const Twitter: Story = {
  args: {
    href: 'https://twitter.com/johndoe',
    onClick: clickJestFn,
    type: LinkType.Twitter,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickJestFn).toHaveBeenCalledTimes(0);
    const link = canvas.getByRole('link');
    await userEvent.click(link);

    await expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};

export const X: Story = {
  args: {
    href: 'https://x.com/johndoe',
    onClick: clickJestFn,
    type: LinkType.Twitter,
  },
};

export const Facebook: Story = {
  args: {
    href: 'https://www.facebook.com/johndoe',
    onClick: clickJestFn,
    type: LinkType.Facebook,
  },
};

export const Instagram: Story = {
  args: {
    href: 'https://www.instagram.com/johndoe',
    onClick: clickJestFn,
    type: LinkType.Instagram,
  },
};

export const TikTok: Story = {
  args: {
    href: 'https://www.tiktok.com/@johndoe',
    onClick: clickJestFn,
    type: LinkType.TikTok,
  },
};

export const Bluesky: Story = {
  args: {
    href: 'https://bsky.app/profile/johndoe.bsky.social',
    onClick: clickJestFn,
    type: LinkType.Bluesky,
  },
};

export const WithCustomLabel: Story = {
  args: {
    href: 'https://www.instagram.com/cristiano',
    label: 'Cristiano Ronaldo Official',
    onClick: clickJestFn,
    type: LinkType.Instagram,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByText('Cristiano Ronaldo Official'),
    ).toBeInTheDocument();
  },
};
