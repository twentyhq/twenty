import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { GroupedItems } from './Field.stories';

const ValidatedFieldExample = () => {
  const [savedValue, setSavedValue] = useState('');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSavedValue(
          String(new FormData(event.currentTarget).get('username')),
        );
      }}
    >
      <Field.Root
        name="username"
        validationMode="onBlur"
        validate={(value) =>
          value === 'taken' ? 'This username is taken' : null
        }
      >
        <Field.Label>Username</Field.Label>
        <Field.Control defaultValue="taken" />
        <Field.Description>Choose a unique username</Field.Description>
        <Field.Error />
        <Field.Validity>
          {({ validity }) => <output>Valid: {String(validity.valid)}</output>}
        </Field.Validity>
      </Field.Root>
      <Button type="submit">Save username</Button>
      <output>Saved username: {savedValue}</output>
    </form>
  );
};

const meta = {
  title: 'UI/Input/Field/Interactions',
  component: Field.Root,
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
} satisfies Meta<typeof Field.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const ItemAssociation: Story = {
  ...GroupedItems,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const important = canvas.getByRole('radio', { name: 'Important updates' });
    const all = canvas.getByRole('radio', { name: 'All updates' });
    const digest = canvas.getByRole('radio', { name: 'Daily digest' });

    await expect(
      canvas.getByRole('radiogroup', { name: 'Notifications' }),
    ).toBeVisible();
    await expect(important).toHaveAccessibleDescription(
      'Only messages that need your attention',
    );
    await expect(all).toHaveAccessibleDescription(
      'Every change to your records',
    );
    await expect(digest).toHaveAttribute('aria-disabled', 'true');
    await expect(important).toBeChecked();
    await userEvent.click(canvas.getByText('All updates'));
    await expect(all).toBeChecked();
    await expect(important).not.toBeChecked();
    await userEvent.click(canvas.getByText('Daily digest'));
    await expect(all).toBeChecked();
  },
};

export const RootDisabled: Story = {
  render: () => (
    <Field.Root disabled>
      <Field.Item disabled={false}>
        <Field.Label>Disabled username</Field.Label>
        <Field.Control defaultValue="Locked" />
      </Field.Item>
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('textbox', { name: 'Disabled username' }),
    ).toBeDisabled();
  },
};

export const Validation: Story = {
  render: () => <ValidatedFieldExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const username = canvas.getByRole('textbox', { name: 'Username' });

    await expect(username).toHaveAccessibleDescription(
      'Choose a unique username',
    );
    await userEvent.click(canvas.getByText('Username', { exact: true }));
    await expect(username).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByText('This username is taken')).toBeVisible();
    await expect(username).toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText('Valid: false')).toBeVisible();
    await userEvent.clear(username);
    await userEvent.type(username, 'raphael');
    await userEvent.tab();
    await expect(username).not.toHaveAttribute('aria-invalid', 'true');
    await expect(canvas.getByText('Valid: true')).toBeVisible();
    await expect(
      canvas.queryByText('This username is taken'),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save username' }),
    );
    await expect(canvas.getByText('Saved username: raphael')).toBeVisible();
  },
};

export const Controlled: Story = {
  render: () => (
    <Field.Root>
      <Field.Label>Account name</Field.Label>
      <Field.Control value="Locked" onValueChange={onValueChange} />
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    const account = within(canvasElement).getByRole('textbox', {
      name: 'Account name',
    });

    await userEvent.type(account, 'a');
    await expect(account).toHaveValue('Locked');
    await expect(onValueChange).toHaveBeenLastCalledWith(
      'Lockeda',
      expect.objectContaining({
        reason: 'none',
        event: expect.objectContaining({ type: 'input' }),
      }),
    );
  },
};

const onValueChange = fn();
