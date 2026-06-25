import { type Meta, type StoryObj } from '@storybook/react-vite';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Field } from '@ui/input/Field/Field';
import { FieldDescription } from '@ui/input/Field/FieldDescription';
import { FieldLabel } from '@ui/input/Field/FieldLabel';

const meta: Meta<typeof Field> = {
  title: 'UI/Input/Field',
  component: Field,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field>
      <FieldLabel>Label</FieldLabel>
      <FieldDescription>This is a hint</FieldDescription>
    </Field>
  ),
};

export const WithError: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field>
      <FieldLabel>Label</FieldLabel>
      <FieldDescription danger>This field is required</FieldDescription>
    </Field>
  ),
};
