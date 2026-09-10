import { CheckboxGroup } from '@base-ui/react/checkbox-group';
import { DirectionProvider } from '@base-ui/react/direction-provider';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from '@ui/input/Checkbox/Checkbox';
import { type CheckboxProps } from '@ui/input/Checkbox/types/CheckboxProps';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Input/Checkbox/Interactions',
  component: Checkbox,
  args: { 'aria-label': 'Select item', onCheckedChange: fn() },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Uncontrolled: Story = {
  args: { defaultChecked: true },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).toBeChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(
      false,
      expect.anything(),
    );
  },
};

export const Keyboard: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await expect(getComputedStyle(checkbox).outlineWidth).toBe('2px');
    await userEvent.keyboard('[Space]');
    await expect(checkbox).toBeChecked();
    await userEvent.keyboard('[Space]');
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await userEvent.click(checkbox);
    await userEvent.tab();
    await expect(checkbox).not.toHaveFocus();
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await userEvent.tab();
    await expect(checkbox).toHaveFocus();
    await userEvent.keyboard('[Space]');
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

const IndeterminateExample = (props: CheckboxProps) => {
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  return (
    <Checkbox
      {...props}
      checked={checked}
      indeterminate={indeterminate}
      onCheckedChange={(value, details) => {
        props.onCheckedChange?.(value, details);
        setChecked(value);
        setIndeterminate(false);
      }}
    />
  );
};

export const Indeterminate: Story = {
  decorators: [ComponentDecorator],
  render: (args) => <IndeterminateExample {...args} />,
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox).toBePartiallyChecked();
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(checkbox).not.toBePartiallyChecked();
  },
};

export const CancelChange: Story = {
  args: { onCheckedChange: (_checked, details) => details.cancel() },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await userEvent.click(checkbox);
    await expect(checkbox).not.toBeChecked();
  },
};

export const ShiftClick: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement, args }) => {
    const user = userEvent.setup();
    await user.keyboard('{Shift>}');
    await user.click(within(canvasElement).getByRole('checkbox'));
    await user.keyboard('{/Shift}');
    await expect(args.onCheckedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        event: expect.objectContaining({ shiftKey: true }),
      }),
    );
  },
};

export const StateComposition: Story = {
  args: {
    className: (state) =>
      state.checked ? 'selected-checkbox' : 'unselected-checkbox',
    style: (state) => ({ marginInlineStart: state.checked ? 7 : 3 }),
    nativeButton: true,
    render: (props, state) => (
      <button
        {...props}
        data-selection={state.checked ? 'selected' : 'unselected'}
      />
    ),
  },
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const checkbox = within(canvasElement).getByRole('checkbox');
    await expect(checkbox.tagName).toBe('BUTTON');
    await expect(checkbox).toHaveClass('unselected-checkbox');
    await userEvent.click(checkbox);
    await expect(checkbox).toHaveClass('selected-checkbox');
    await expect(checkbox).toHaveAttribute('data-selection', 'selected');
    await expect(checkbox).toHaveStyle({ marginInlineStart: '7px' });
  },
};

export const GroupIndeterminate: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <CheckboxGroup
      allValues={['one', 'two']}
      defaultValue={['one']}
      aria-label="Items"
    >
      <Checkbox parent aria-label="Select all" />
      <Checkbox value="one" aria-label="First item" />
      <Checkbox value="two" aria-label="Second item" />
    </CheckboxGroup>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const parent = canvas.getByRole('checkbox', { name: 'Select all' });
    await expect(parent).toBePartiallyChecked();
    await userEvent.click(parent);
    await expect(
      canvas.getByRole('checkbox', { name: 'First item' }),
    ).toBeChecked();
    await expect(
      canvas.getByRole('checkbox', { name: 'Second item' }),
    ).toBeChecked();
    await expect(parent).toBeChecked();
  },
};

export const SizesAndRtl: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <DirectionProvider direction="rtl">
      <div dir="rtl">
        <Checkbox size="sm" aria-label="Small" />
        <Checkbox size="md" aria-label="Medium" />
        <Checkbox size="sm" hoverable={false} aria-label="Small compact" />
        <Checkbox size="md" hoverable={false} aria-label="Medium compact" />
      </div>
    </DirectionProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const [label, size] of [
      ['Small', 24],
      ['Medium', 32],
      ['Small compact', 14],
      ['Medium compact', 20],
    ] as const) {
      const checkbox = canvas.getByRole('checkbox', { name: label });
      await expect(checkbox.getBoundingClientRect().width).toBe(size);
      await expect(checkbox.getBoundingClientRect().height).toBe(size);
      await userEvent.click(checkbox);
      await expect(checkbox).toBeChecked();
    }
  },
};
