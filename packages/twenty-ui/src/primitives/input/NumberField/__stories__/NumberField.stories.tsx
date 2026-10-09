import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconMinus, IconPlus } from '@ui/icon';
import { Field } from '@ui/primitives/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { NumberField } from '../NumberField';

const meta = {
  title: 'UI/Input/NumberField',
  component: NumberField.Root,
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 280 },
  },
  args: { defaultValue: 3, min: 0, max: 10 },
  render: (args) => (
    <Field.Root>
      <Field.Label>Quantity</Field.Label>
      <NumberField.Root {...args}>
        <NumberField.Group>
          <NumberField.Decrement aria-label="Decrease quantity">
            <IconMinus size={16} />
          </NumberField.Decrement>
          <NumberField.Input />
          <NumberField.Increment aria-label="Increase quantity">
            <IconPlus size={16} />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
      <Field.Description>Choose up to ten items.</Field.Description>
    </Field.Root>
  ),
} satisfies Meta<typeof NumberField.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { defaultValue: undefined },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
};

export const LocaleCurrency: Story = {
  args: {
    defaultValue: 1234.5,
    min: 0,
    max: undefined,
    locale: 'de-DE',
    format: { style: 'currency', currency: 'EUR' },
    step: 0.5,
    smallStep: 0.01,
    largeStep: 10,
  },
  render: (args) => (
    <Field.Root>
      <Field.Label>Amount in euros</Field.Label>
      <NumberField.Root {...args} name="amount">
        <NumberField.Input />
      </NumberField.Root>
      <Field.Description>German locale with euro formatting.</Field.Description>
    </Field.Root>
  ),
};

export const WithScrubbing: Story = {
  args: { defaultValue: 240, min: 0, max: 1000, step: 1 },
  render: (args) => (
    <Field.Root>
      <NumberField.Root {...args}>
        <NumberField.ScrubArea style={{ cursor: 'ew-resize' }}>
          <Field.Label>Width</Field.Label>
          <NumberField.ScrubAreaCursor>↔</NumberField.ScrubAreaCursor>
        </NumberField.ScrubArea>
        <NumberField.Group>
          <NumberField.Decrement aria-label="Decrease width">
            <IconMinus size={16} />
          </NumberField.Decrement>
          <NumberField.Input />
          <NumberField.Increment aria-label="Increase width">
            <IconPlus size={16} />
          </NumberField.Increment>
        </NumberField.Group>
      </NumberField.Root>
      <Field.Description>Drag the width label to adjust it.</Field.Description>
    </Field.Root>
  ),
};
