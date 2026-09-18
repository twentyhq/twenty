import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ListItemSwitchExample } from '@ui/primitives/navigation/ListItem/__stories__/ListItemSwitchExample';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ListItemSwitchExample> = {
  title: 'UI/Input/Switch/Integrations',
  component: ListItemSwitchExample,
  parameters: { container: { width: 300 } },
};

export default meta;
type Story = StoryObj<typeof ListItemSwitchExample>;

export const SettingsRow: Story = {
  decorators: [ComponentDecorator],
  args: { onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);

    control.focus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(3);
  },
};

export const DisabledSettingsRow: Story = {
  decorators: [ComponentDecorator],
  args: { disabled: true, onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await userEvent.click(canvas.getByText('Notifications'));
    await userEvent.click(control);

    await expect(control).not.toBeChecked();
    await expect(control).toHaveAttribute('aria-disabled', 'true');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};
