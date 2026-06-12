import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconX } from '@ui/display';
import { ComponentDecorator } from '@ui/testing';

import { VisibilityHidden } from '../VisibilityHidden';

const meta: Meta<typeof VisibilityHidden> = {
  title: 'UI/Accessibility/VisibilityHidden',
  component: VisibilityHidden,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof VisibilityHidden>;

export const Default: Story = {
  args: {
    children: 'Visible only to screen readers',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const hiddenText = canvas.getByText('Visible only to screen readers');

    await expect(hiddenText).toBeInTheDocument();
  },
};

export const InsideIconButton: Story = {
  render: () => (
    <button type="button">
      <VisibilityHidden>Close</VisibilityHidden>
      <IconX size={16} />
    </button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const button = canvas.getByRole('button', { name: 'Close' });

    await expect(button).toBeVisible();
    await expect(button).toHaveAccessibleName('Close');
  },
};
