import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { AdvancedSettingsToggle } from '@ui/input/AdvancedSettingsToggle/AdvancedSettingsToggle';
import { MenuItemToggle } from '@ui/navigation/MenuItemToggle/MenuItemToggle';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof MenuItemToggle> = {
  title: 'UI/Input/Switch/Integrations',
  component: MenuItemToggle,
  parameters: { container: { width: 300 }, a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof MenuItemToggle>;

type MenuSwitchProps = { onToggleChange?: (checked: boolean) => void };

const MenuSwitch = ({ onToggleChange }: MenuSwitchProps) => {
  const [checked, setChecked] = useState(false);
  return (
    <MenuItemToggle
      text="Notifications"
      toggled={checked}
      onToggleChange={(nextChecked) => {
        setChecked(nextChecked);
        onToggleChange?.(nextChecked);
      }}
    />
  );
};

export const MenuItem: Story = {
  decorators: [ComponentDecorator],
  args: { onToggleChange: fn() },
  render: (args) => <MenuSwitch {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onToggleChange).toHaveBeenCalledTimes(1);
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    await expect(args.onToggleChange).toHaveBeenCalledTimes(2);
  },
};

const AdvancedSwitch = () => {
  const [enabled, setEnabled] = useState(false);
  return (
    <AdvancedSettingsToggle
      label="Advanced"
      isAdvancedModeEnabled={enabled}
      setIsAdvancedModeEnabled={setEnabled}
    />
  );
};

export const AdvancedSettings: Story = {
  decorators: [ComponentDecorator],
  render: () => <AdvancedSwitch />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Advanced' });
    await userEvent.click(canvas.getByText('Advanced'));
    await expect(control).toBeChecked();
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
  },
};
