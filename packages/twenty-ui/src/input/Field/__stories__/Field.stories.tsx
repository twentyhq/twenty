import { type Meta, type StoryObj } from '@storybook/react-vite';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Field } from '@ui/input/Field/Field';

const meta: Meta<typeof Field.Root> = {
  title: 'UI/Input/Field',
  component: Field.Root,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof Field.Root>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field.Root>
      <Field.Label>Label</Field.Label>
      <Field.Description>This is a hint</Field.Description>
    </Field.Root>
  ),
};

export const WithError: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field.Root>
      <Field.Label>Label</Field.Label>
      <Field.Error>This field is required</Field.Error>
    </Field.Root>
  ),
};
