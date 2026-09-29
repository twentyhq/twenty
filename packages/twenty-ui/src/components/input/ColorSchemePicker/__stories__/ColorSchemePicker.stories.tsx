import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { ColorSchemePicker } from '../ColorSchemePicker';

const meta: Meta<typeof ColorSchemePicker> = {
  title: 'UI/Input/ColorSchemePicker',
  component: ColorSchemePicker,
  decorators: [ComponentDecorator],
  args: {
    value: 'Light',
    lightLabel: 'Light',
    darkLabel: 'Dark',
    systemLabel: 'System',
    onChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof ColorSchemePicker>;

export const Default: Story = {};

export const SuppliedLabels: Story = {
  args: {
    lightLabel: 'Day appearance',
    darkLabel: 'Night appearance',
    systemLabel: 'Device appearance',
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    for (const label of [args.lightLabel, args.darkLabel, args.systemLabel]) {
      expect(canvas.getByText(label)).toBeVisible();
      expect(canvas.getByRole('button', { name: label })).toBeVisible();
    }

    await userEvent.click(canvas.getByRole('button', { name: args.darkLabel }));
    expect(args.onChange).toHaveBeenLastCalledWith('Dark');
    canvas.getByRole('button', { name: args.systemLabel }).focus();
    await userEvent.keyboard('{Enter}');
    expect(args.onChange).toHaveBeenLastCalledWith('System');
  },
};
