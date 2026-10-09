import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type MouseEvent } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { SettingsRow } from '../SettingsRow';
import { ControlledSettingsRowExample } from './ControlledSettingsRowExample';
import { ControlledSettingsRowFormExample } from './ControlledSettingsRowFormExample';

const meta: Meta<typeof SettingsRow> = {
  id: 'ui-components-settingsrow-interactions',
  title: 'UI/Components/Settings/SettingsRow/Interactions',
  component: SettingsRow,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  args: {
    children: 'Notifications',
    switchProps: { onCheckedChange: fn() },
  },
};

export default meta;
type Story = StoryObj<typeof SettingsRow>;

export const Controlled: Story = {
  render: (args) => <ControlledSettingsRowExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(1);

    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(2);
    await expect(args.switchProps?.onCheckedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        event: expect.objectContaining({ type: 'click' }),
      }),
    );

    control.focus();
    await userEvent.keyboard(' ');
    await expect(control).toBeChecked();
    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(3);
  },
};

export const IndependentRows: Story = {
  render: (args) => (
    <>
      <SettingsRow {...args} />
      <SettingsRow switchProps={{ defaultChecked: true }}>
        Weekly digest
      </SettingsRow>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const notifications = canvas.getByRole('switch', { name: 'Notifications' });
    const digest = canvas.getByRole('switch', { name: 'Weekly digest' });

    await expect(notifications).not.toBeChecked();
    await expect(digest).toBeChecked();
    await userEvent.click(canvas.getByText('Weekly digest'));
    await expect(digest).not.toBeChecked();
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(notifications).toBeChecked();
    await expect(digest).not.toBeChecked();
  },
};

export const Disabled: Story = {
  args: { switchProps: { disabled: true, onCheckedChange: fn() } },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await userEvent.click(canvas.getByText('Notifications'));
    await userEvent.click(control);
    await userEvent.tab();

    await expect(control).not.toHaveFocus();
    await expect(control).not.toBeChecked();
    await expect(control).toHaveAttribute('aria-disabled', 'true');
    await expect(args.switchProps?.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: {
    switchProps: {
      readOnly: true,
      defaultChecked: true,
      onCheckedChange: fn(),
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await userEvent.click(canvas.getByText('Notifications'));
    control.focus();
    await userEvent.keyboard(' ');

    await expect(control).toHaveFocus();
    await expect(control).toBeChecked();
    await expect(control).toHaveAttribute('aria-readonly', 'true');
    await expect(args.switchProps?.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const AccessibleDescription: Story = {
  args: {
    children: <Text>Notifications</Text>,
    description: <Text>Updates by email</Text>,
  },
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await expect(control).toHaveAccessibleDescription('Updates by email');
    await userEvent.click(canvas.getByText('Updates by email'));
    await expect(control).toBeChecked();
  },
};

export const AccessibleOverrides: Story = {
  args: {
    description: 'Updates by email',
    switchProps: {
      'aria-label': 'Email preferences',
      'aria-labelledby': undefined,
      'aria-describedby': 'notification-description',
    },
  },
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: (args) => (
    <>
      <Text id="notification-description">Receive workspace updates</Text>
      <SettingsRow {...args} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Email preferences' });

    await expect(control).toHaveAccessibleDescription(
      'Receive workspace updates',
    );
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).toBeChecked();
  },
};

export const CanceledChange: Story = {
  args: {
    switchProps: {
      onCheckedChange: fn((_checked, eventDetails) => eventDetails.cancel()),
    },
  },
  render: (args) => <ControlledSettingsRowExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Notifications'));

    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('switch')).not.toBeChecked();
  },
};

export const CanceledLabelActivation: Story = {
  args: {
    onClick: fn((event: MouseEvent<HTMLLabelElement>) =>
      event.preventDefault(),
    ),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Notifications'));

    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(args.switchProps?.onCheckedChange).not.toHaveBeenCalled();
    await expect(canvas.getByRole('switch')).not.toBeChecked();
  },
};

export const NativeTargets: Story = {
  args: {
    id: 'notification-row',
    title: 'Notification row',
    ref: fn(),
    onClick: fn(),
    render: (props) => (
      <label {...props} data-composed-label="true">
        <span data-composed-content="true" style={{ display: 'contents' }}>
          {props.children}
        </span>
      </label>
    ),
    switchProps: {
      id: 'notification-control',
      title: 'Notification control',
      name: 'notifications',
      ref: fn(),
      inputRef: fn(),
      onClick: fn(),
      onCheckedChange: fn(),
      nativeButton: true,
      render: (props, state) => (
        <button {...props} data-composed-checked={state.checked} />
      ),
      className: (state) =>
        state.checked ? 'consumer-checked' : 'consumer-unchecked',
      style: (state) => ({ marginInlineStart: state.checked ? 8 : 0 }),
    },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });
    const label = canvas.getByText('Notifications').closest('label');
    const input = canvasElement.querySelector('input[name="notifications"]');

    await expect(label).toHaveAttribute('id', 'notification-row');
    await expect(label).toHaveAttribute('for', 'notification-control');
    await expect(label).toHaveAttribute('title', 'Notification row');
    await expect(label).toHaveAttribute('data-composed-label', 'true');
    await expect(control.closest('[data-composed-content]')).toHaveAttribute(
      'data-composed-content',
      'true',
    );
    await expect(args.ref).toHaveBeenCalledWith(label);
    await expect(control).toHaveAttribute('id', 'notification-control');
    await expect(control).toHaveAttribute('title', 'Notification control');
    await expect(args.switchProps?.ref).toHaveBeenCalledWith(control);
    await expect(args.switchProps?.inputRef).toHaveBeenCalledWith(input);
    await expect(control).toHaveClass('consumer-unchecked');

    await userEvent.click(control);

    await expect(args.onClick).toHaveBeenCalledTimes(1);
    await expect(args.switchProps?.onClick).toHaveBeenCalledTimes(1);
    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(control).toHaveClass('consumer-checked');
    await expect(control).toHaveAttribute('data-composed-checked', 'true');
    await expect(control).toHaveStyle({ marginInlineStart: '8px' });
    await expect(control).toBeChecked();
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(2);
  },
};

export const FormSubmission: Story = {
  render: (args) => (
    <form
      aria-label="Notification preferences"
      onSubmit={(event) => event.preventDefault()}
    >
      <SettingsRow
        {...args}
        switchProps={{
          ...args.switchProps,
          name: 'notifications',
          value: 'enabled',
          required: true,
        }}
      />
      <Button type="submit">Save</Button>
    </form>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole<HTMLFormElement>('form', {
      name: 'Notification preferences',
    });
    const onSubmit = fn();
    form.addEventListener('submit', onSubmit);

    try {
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }));
      await expect(onSubmit).not.toHaveBeenCalled();
      await expect(new FormData(form).has('notifications')).toBe(false);

      await userEvent.click(canvas.getByText('Notifications'));
      await userEvent.click(canvas.getByRole('button', { name: 'Save' }));

      await expect(onSubmit).toHaveBeenCalledTimes(1);
      await expect(new FormData(form).get('notifications')).toBe('enabled');
    } finally {
      form.removeEventListener('submit', onSubmit);
    }
  },
};

export const ControlledFormReset: Story = {
  args: {
    switchProps: {
      defaultChecked: true,
      name: 'notifications',
      value: 'enabled',
      uncheckedValue: 'disabled',
      onCheckedChange: fn(),
    },
  },
  render: (args) => <ControlledSettingsRowFormExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });
    const form = canvas.getByRole<HTMLFormElement>('form', {
      name: 'Notification preferences',
    });

    await expect(control).toBeChecked();
    await expect(new FormData(form).get('notifications')).toBe('enabled');
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    await expect(new FormData(form).get('notifications')).toBe('disabled');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(() => expect(control).toBeChecked());
    await expect(new FormData(form).get('notifications')).toBe('enabled');
    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(1);
  },
};

export const UncontrolledFormReset: Story = {
  args: { switchProps: { defaultChecked: true, onCheckedChange: fn() } },
  render: (args) => (
    <form>
      <SettingsRow {...args} />
      <Button type="reset">Reset</Button>
    </form>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await expect(control).toBeChecked();
    await userEvent.click(canvas.getByText('Notifications'));
    await expect(control).not.toBeChecked();
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(control).not.toBeChecked();
    await expect(args.switchProps?.onCheckedChange).toHaveBeenCalledTimes(1);
  },
};
