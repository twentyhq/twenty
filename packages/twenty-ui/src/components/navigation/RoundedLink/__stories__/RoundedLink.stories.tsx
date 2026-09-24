import { type MouseEvent } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { RoundedLink } from '@ui/components/navigation/RoundedLink/RoundedLink';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof RoundedLink> = {
  title: 'UI/Navigation/Link/RoundedLink',
  component: RoundedLink,
  decorators: [ComponentDecorator],
  args: {
    href: '/test',
    label: 'Rounded chip',
  },
};

export default meta;
type Story = StoryObj<typeof RoundedLink>;
const handleClick = fn((event: MouseEvent<HTMLElement>) => {
  event.preventDefault();
});

export const Default: Story = {
  args: {
    onClick: handleClick,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(handleClick).toHaveBeenCalledTimes(0);
    const link = canvas.getByRole('link', { name: 'Rounded chip' });

    await expect(link).toHaveAttribute('href', '/test');
    await userEvent.click(link);

    await expect(handleClick).toHaveBeenCalledTimes(1);
  },
};
