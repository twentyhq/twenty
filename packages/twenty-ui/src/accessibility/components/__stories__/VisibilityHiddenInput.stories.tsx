import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { VisibilityHiddenInput } from '../VisibilityHiddenInput';

const meta: Meta<typeof VisibilityHiddenInput> = {
  title: 'UI/Accessibility/VisibilityHiddenInput',
  component: VisibilityHiddenInput,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof VisibilityHiddenInput>;

export const Default: Story = {
  render: () => (
    <label>
      <VisibilityHiddenInput type="checkbox" />
      Enable notifications
    </label>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const checkbox = canvas.getByRole('checkbox', {
      name: 'Enable notifications',
    });

    await expect(checkbox).not.toBeChecked();

    await userEvent.click(canvas.getByText('Enable notifications'));

    await expect(checkbox).toBeChecked();
    await expect(checkbox).toHaveFocus();

    await userEvent.keyboard(' ');

    await expect(checkbox).not.toBeChecked();
  },
};
