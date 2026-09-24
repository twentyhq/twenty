import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconPencil, IconX } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { AnimatedIconCrossfade } from '../AnimatedIconCrossfade';

const meta = {
  title: 'UI/Input/Button/Button',
  component: AnimatedIconCrossfade,
  tags: ['!autodocs'],
  args: { isActive: false, ActiveIcon: IconX, InactiveIcon: IconPencil },
} satisfies Meta<typeof AnimatedIconCrossfade>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AnimatedIcon: Story = {
  decorators: [ComponentDecorator],
  render: function Render() {
    const [isEditing, setIsEditing] = useState(false);

    return (
      <Button
        size="sm"
        aria-expanded={isEditing}
        onClick={() => setIsEditing(!isEditing)}
        startIcon={
          <AnimatedIconCrossfade
            isActive={isEditing}
            ActiveIcon={IconX}
            InactiveIcon={IconPencil}
          />
        }
      >
        Edit actions
      </Button>
    );
  },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Edit actions',
    });
    await document.fonts.load('500 1em Inter');
    await document.fonts.ready;
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
export const AnimatedIconDocumentation: Story = {
  ...AnimatedIcon,
  play: undefined,
};
