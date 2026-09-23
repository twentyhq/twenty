import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { SettingsRow } from '../SettingsRow';
import { ControlledSettingsRowExample } from './ControlledSettingsRowExample';

const meta: Meta<typeof SettingsRow> = {
  title: 'UI/Components/SettingsRow/Interactions',
  component: SettingsRow,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320 } },
  args: { children: 'Notifications', onCheckedChange: fn() },
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

export const IndependentRows: Story = {
  render: (args) => (
    <>
      <SettingsRow {...args} />
      <SettingsRow defaultChecked>Weekly digest</SettingsRow>
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
  args: { disabled: true },
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

export const ReadOnly: Story = {
  args: { readOnly: true, defaultChecked: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await userEvent.click(canvas.getByText('Notifications'));
    control.focus();
    await userEvent.keyboard(' ');

    await expect(control).toHaveFocus();
    await expect(control).toBeChecked();
    await expect(control).toHaveAttribute('aria-readonly', 'true');
    await expect(args.onCheckedChange).not.toHaveBeenCalled();
  },
};

export const AccessibleDescription: Story = {
  args: { description: 'Updates by email' },
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const control = canvas.getByRole('switch', { name: 'Notifications' });

    await expect(control).toHaveAccessibleDescription('Updates by email');
    await userEvent.click(canvas.getByText('Updates by email'));
    await expect(control).toBeChecked();
  },
};

export const CanceledChange: Story = {
  args: {
    onCheckedChange: fn((_checked, eventDetails) => eventDetails.cancel()),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByText('Notifications'));

    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await expect(canvas.getByRole('switch')).not.toBeChecked();
  },
};

export const FormSubmission: Story = {
  render: (args) => (
    <form
      aria-label="Notification preferences"
      onSubmit={(event) => event.preventDefault()}
    >
      <SettingsRow {...args} name="notifications" value="enabled" required />
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
