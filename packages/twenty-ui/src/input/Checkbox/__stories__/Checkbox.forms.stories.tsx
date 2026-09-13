import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Checkbox } from '@ui/input/Checkbox/Checkbox';
import { Field } from '@ui/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Input/Checkbox/Forms',
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const WrappingLabel: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <label htmlFor="checkbox-terms">
      <Checkbox id="checkbox-terms" />
      Accept terms
    </label>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Accept terms'));
    await expect(
      canvas.getByRole('checkbox', { name: 'Accept terms' }),
    ).toBeChecked();
  },
};

export const SiblingLabel: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <div>
      <Checkbox id="checkbox-notifications" nativeButton render={<button />} />
      <label htmlFor="checkbox-notifications">Receive notifications</label>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Receive notifications'));
    await expect(
      canvas.getByRole('checkbox', { name: 'Receive notifications' }),
    ).toBeChecked();
  },
};

export const FieldLabel: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  decorators: [ComponentDecorator],
  render: () => (
    <Field.Root name="reminders">
      <Field.Label>
        <Checkbox />
        Send reminders
      </Field.Label>
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Send reminders'));
    await expect(
      canvas.getByRole('checkbox', { name: 'Send reminders' }),
    ).toBeChecked();
  },
};

const FormExample = () => {
  const [checked, setChecked] = useState(false);
  const [submittedValue, setSubmittedValue] = useState('Not submitted');
  return (
    <form
      onReset={() => setChecked(false)}
      onSubmit={(event) => {
        event.preventDefault();
        setSubmittedValue(
          String(new FormData(event.currentTarget).get('terms')),
        );
      }}
    >
      <label htmlFor="checkbox-form-terms">
        <Checkbox
          id="checkbox-form-terms"
          checked={checked}
          onCheckedChange={setChecked}
          name="terms"
          value="accepted"
          required
        />
        Accept terms
      </label>
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
      <output aria-label="Submitted value">{submittedValue}</output>
    </form>
  );
};

export const FormSubmissionAndReset: Story = {
  decorators: [ComponentDecorator],
  render: () => <FormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Accept terms' });
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('Not submitted');
    await userEvent.click(checkbox);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('accepted');
    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await expect(checkbox).not.toBeChecked();
  },
};

const UncheckedValueExample = () => {
  const [submittedValue, setSubmittedValue] = useState('Not submitted');
  return (
    <form
      id="checkbox-external-form"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        setSubmittedValue(
          `${formData.get('notifications')}/${formData.has('disabled')}/${formData.has('styled-checkbox')}`,
        );
      }}
    >
      <Checkbox
        name="notifications"
        value="yes"
        uncheckedValue="no"
        aria-label="Notifications"
      />
      <Checkbox name="disabled" disabled defaultChecked aria-label="Disabled" />
      <Checkbox defaultChecked aria-label="Unnamed" />
      <button type="submit">Submit</button>
      <output>{submittedValue}</output>
    </form>
  );
};

export const NativeFormValues: Story = {
  decorators: [ComponentDecorator],
  render: () => <UncheckedValueExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'no/false/false',
    );
    await userEvent.click(
      canvas.getByRole('checkbox', { name: 'Notifications' }),
    );
    await userEvent.click(canvas.getByRole('button', { name: 'Submit' }));
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'yes/false/false',
    );
  },
};

const ClickableRowExample = ({
  onCheckedChange,
}: {
  onCheckedChange: (checked: boolean) => void;
}) => {
  const [checked, setChecked] = useState(false);
  const select = (value: boolean) => {
    setChecked(value);
    onCheckedChange(value);
  };
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events
    <div
      onClick={() => select(!checked)}
      role="group"
      aria-label="Selection row"
    >
      <span>Row label</span>
      <Checkbox
        aria-label="Select row"
        checked={checked}
        onCheckedChange={select}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
};

export const ClickableRow: StoryObj<typeof ClickableRowExample> = {
  args: { onCheckedChange: fn() },
  decorators: [ComponentDecorator],
  render: (args) => <ClickableRowExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const checkbox = canvas.getByRole('checkbox', { name: 'Select row' });
    await userEvent.click(checkbox);
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('[Space]');
    await expect(checkbox).not.toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(2);
    await userEvent.click(canvas.getByText('Row label'));
    await expect(checkbox).toBeChecked();
    await expect(args.onCheckedChange).toHaveBeenCalledTimes(3);
  },
};
