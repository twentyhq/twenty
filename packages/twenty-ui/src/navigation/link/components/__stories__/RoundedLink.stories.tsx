import { type Meta, type StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ComponentWithRouterDecorator } from '@ui/testing';
import { RoundedLink } from '../RoundedLink';

const meta: Meta<typeof RoundedLink> = {
  title: 'UI/Navigation/Link/RoundedLink',
  component: RoundedLink,
  decorators: [ComponentWithRouterDecorator],
  args: {
    href: '/test',
    label: 'Rounded chip',
  },
};

export default meta;
type Story = StoryObj<typeof RoundedLink>;
const clickJestFn = fn();

export const Default: Story = {
  args: {
    onClick: clickJestFn,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(clickJestFn).toHaveBeenCalledTimes(0);
    const link = canvas.getByRole('link');
    await userEvent.click(link);

    await expect(clickJestFn).toHaveBeenCalledTimes(1);
  },
};
