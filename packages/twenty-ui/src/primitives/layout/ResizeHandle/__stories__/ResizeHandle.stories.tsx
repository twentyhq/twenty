import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { expect, userEvent, within } from 'storybook/test';

import { ResizeHandle } from '@ui/primitives/layout/ResizeHandle/ResizeHandle';

import { ResizableDemo } from './ResizableDemo';

const meta: Meta<typeof ResizeHandle> = {
  title: 'UI/Layout/ResizeHandle',
  component: ResizeHandle,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof ResizeHandle>;

export const Resizable: Story = {
  render: () => <ResizableDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const handle = canvas.getByRole('separator', { name: 'Resize height' });

    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByText('160 pixels')).toBeVisible();
    await expect(handle).toHaveAttribute('aria-valuenow', '160');
    await userEvent.keyboard('{Home}');
    await expect(handle).toHaveAttribute('aria-valuenow', '50');
    await userEvent.keyboard('{End}');
    await expect(handle).toHaveAttribute('aria-valuenow', '500');
  },
};

export const Horizontal: Story = {
  render: () => <ResizableDemo axis="x" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', { name: 'Resize width' });

    handle.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(handle).toHaveAttribute('aria-valuenow', '160');
    await expect(handle).toHaveAttribute('aria-orientation', 'vertical');
  },
};
