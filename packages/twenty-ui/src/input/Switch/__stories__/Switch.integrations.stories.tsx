import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { MenuItemSwitch } from '@ui/navigation/MenuItemSwitch/MenuItemSwitch';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof MenuItemSwitch> = {
  title: 'UI/Input/Switch/Integrations',
  component: MenuItemSwitch,
  parameters: { container: { width: 300 }, a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj<typeof MenuItemSwitch>;

type MenuSwitchProps = { onToggleChange?: (checked: boolean) => void };

const MenuSwitch = ({ onToggleChange }: MenuSwitchProps) => {
  const [checked, setChecked] = useState(false);
  return (
    <MenuItemSwitch
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
