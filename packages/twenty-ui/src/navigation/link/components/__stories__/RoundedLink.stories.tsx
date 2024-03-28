import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';

import { RoundedLink } from '../RoundedLink';

const meta: Meta<typeof RoundedLink> = {
  title: 'UI/Navigation/Link/RoundedLink',
  component: RoundedLink,
  decorators: [ComponentDecorator, RouterDecorator],
  args: {
    href: '/test',
    children: 'Rounded chip',
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
