import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconPencil, IconX } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { AnimatedIconCrossfade } from '../AnimatedIconCrossfade';

const meta = {
  title: 'UI/Components/Layout/AnimatedIconCrossfade',
  component: AnimatedIconCrossfade,
  tags: ['!autodocs'],
  args: {
    isActive: false,
    activeIcon: <IconX size={14} />,
    inactiveIcon: <IconPencil size={14} />,
  },
} satisfies Meta<typeof AnimatedIconCrossfade>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = {
  decorators: [ComponentDecorator],
  argTypes: { isActive: { control: false } },
  render: function Render(args) {
    const [isEditing, setIsEditing] = useState(false);

    return (
      <Button
        size="sm"
        aria-expanded={isEditing}
        onClick={() => setIsEditing(!isEditing)}
        startIcon={<AnimatedIconCrossfade {...args} isActive={isEditing} />}
      >
        Edit actions
      </Button>
    );
  },
};

export const AnimatedIcon: Story = {
  ...Display,
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Edit actions',
    });
    const icons = button.querySelectorAll('svg');
    const pencil = icons[0]!;
    const cross = icons[1]!;
    const originalWidth = button.getBoundingClientRect().width;

    await expect(button.getBoundingClientRect().height).toBe(24);
    await expect(pencil.getBoundingClientRect().width).toBe(14);
    button.focus();
    await userEvent.keyboard('{Enter}');
    await expect(button).toHaveAttribute('aria-expanded', 'true');
    await waitFor(() => {
      expect(getComputedStyle(pencil.parentElement!).opacity).toBe('0');
      expect(getComputedStyle(cross.parentElement!).opacity).toBe('1');
    });
    await waitFor(() =>
      expect(button.getBoundingClientRect().width).toBe(originalWidth),
    );
    await userEvent.keyboard(' ');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.tab();
  },
};
