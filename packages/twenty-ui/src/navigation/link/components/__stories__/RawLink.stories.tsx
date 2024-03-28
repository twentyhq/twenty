import { Meta, StoryObj } from '@storybook/react';
import { expect, fn, userEvent, within } from '@storybook/test';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';

import { RawLink } from '../RawLink';

const meta: Meta<typeof RawLink> = {
  title: 'UI/Navigation/Link/RawLink',
  component: RawLink,
  decorators: [ComponentDecorator, RouterDecorator],
  args: {
    className: 'RawLink',
    href: '/test',
    children: 'Raw Link',
  },
};

export default meta;
type Story = StoryObj<typeof RawLink>;
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
