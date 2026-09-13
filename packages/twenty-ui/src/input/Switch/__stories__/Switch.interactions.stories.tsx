import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Field } from '@ui/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Switch } from '../Switch';
import { type SwitchProps } from '../types/SwitchProps';

const meta: Meta<typeof Switch> = {
  title: 'UI/Input/Switch/Interactions',
  component: Switch,
  args: { 'aria-label': 'Notifications' },
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Pointer: Story = {
  decorators: [ComponentDecorator],
  args: { onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('switch');
    await expect(control).not.toBeChecked();
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(args.onCheckedChange).toHaveBeenCalledWith(
      true,
      expect.objectContaining({
        event: expect.objectContaining({ type: 'click' }),
      }),
    );
    await userEvent.click(control);
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

export const Keyboard: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('switch');
    await userEvent.tab();
    await expect(control).toHaveFocus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(control).not.toBeChecked();
  },
};

const ControlledSwitch = (props: SwitchProps) => {
  const [checked, setChecked] = useState(false);
  return (
    <>
      <Switch
        {...props}
        checked={checked}
        onCheckedChange={(nextChecked, details) => {
          props.onCheckedChange?.(nextChecked, details);
          setChecked(nextChecked);
        }}
      />
      <button onClick={() => setChecked(false)}>Reset notifications</button>
    </>
  );
};

export const Controlled: Story = {
  ...Pointer,
  render: (args) => <ControlledSwitch {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch');
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Reset notifications' }),
    );
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
  },
};

export const Disabled: Story = {
  ...Pointer,
  args: { disabled: true, onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('switch');
    await expect(control).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(control);
    await userEvent.tab();
    await expect(control).not.toHaveFocus();
    await expect(control).not.toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  ...Pointer,
  args: { readOnly: true, defaultChecked: true, onCheckedChange: fn() },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('switch');
    await userEvent.click(control);
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const CanceledChange: Story = {
  ...Pointer,
  args: { onCheckedChange: fn((_checked, details) => details.cancel()) },
  play: async ({ canvasElement, args }) => {
    const control = within(canvasElement).getByRole('switch');
    await userEvent.click(control);
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(control).not.toBeChecked();
  },
};

export const NativeButton: Story = {
  ...Pointer,
  args: { nativeButton: true, render: <button />, onCheckedChange: fn() },
};

export const StateCallbacks: Story = {
  ...Pointer,
  args: {
    onCheckedChange: fn(),
    className: (state) =>
      state.checked ? 'consumer-checked' : 'consumer-unchecked',
    style: (state) => ({ marginInlineStart: state.checked ? 8 : 0 }),
    render: (props, state) => (
      <span {...props} data-consumer-checked={state.checked} />
    ),
  },
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('switch');
    await expect(control).toHaveClass('consumer-unchecked');
    await userEvent.click(control);
    await expect(control).toHaveClass('consumer-checked');
    await expect(control).toHaveAttribute('data-consumer-checked', 'true');
    await expect(control).toHaveStyle({ marginInlineStart: '8px' });
    await expect(control).toBeChecked();
  },
};

const SwitchForm = () => {
  const [submitted, setSubmitted] = useState('');
  const [checked, setChecked] = useState(true);
  return (
    <form
      onReset={() => setChecked(true)}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(
          String(new FormData(event.currentTarget).get('notifications')),
        );
      }}
    >
      <Field.Root name="notifications">
        <Field.Label>
          <Switch
            checked={checked}
            onCheckedChange={setChecked}
            value="enabled"
            uncheckedValue="disabled"
          />
          Notifications
        </Field.Label>
        <Field.Description>
          Receive updates about your workspace.
        </Field.Description>
      </Field.Root>
      <button type="submit">Save</button>
      <button type="reset">Reset</button>
      <output aria-label="Submitted value">{submitted}</output>
    </form>
  );
};

export const FormAndField: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  decorators: [ComponentDecorator],
  render: () => <SwitchForm />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });
    await expect(control).toHaveAccessibleDescription(
      'Receive updates about your workspace.',
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('enabled');
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('disabled');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(control).toBeChecked());
  },
};

export const SiblingLabel: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <>
      <label htmlFor="notification-switch">Notifications</label>
      <Switch id="notification-switch" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(
      canvas.getByRole('switch', { name: 'Notifications' }),
    ).toBeChecked();
  },
};

export const RightToLeft: Story = {
  ...Pointer,
  render: (args) => (
    <div dir="rtl">
      <Switch {...args} />
    </div>
  ),
};
