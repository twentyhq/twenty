import { type ComponentProps } from 'react';
import { Input } from '@ui/primitives/input';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Field } from '@ui/primitives/input/Field/Field';
import { Radio } from '@ui/primitives/input/Radio/Radio';
import { RadioGroup } from '@ui/primitives/input/RadioGroup/RadioGroup';

const meta: Meta<typeof Field.Root> = {
  title: 'UI/Input/Field',
  component: Field.Root,
};

export default meta;

type Story = StoryObj<typeof Field.Root>;

export const Display: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST, container: { width: 320 } },
  render: (args) => <FieldDisplayExample {...args} />,
};

const FieldDisplayExample = (props: ComponentProps<typeof Field.Root>) => (
  <Field.Root name="email" validationMode="onBlur" {...props}>
    <Field.Label>Work email</Field.Label>
    <Input type="email" required placeholder="you@example.com" />
    <Field.Description>
      We send account updates to this address.
    </Field.Description>
    <Field.Error match="valueMissing">Enter your email address.</Field.Error>
    <Field.Error match="typeMismatch">Enter a valid email address.</Field.Error>
  </Field.Root>
);

export const WithError: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field.Root>
      <Field.Label>Label</Field.Label>
      <Field.Error match>This field is required</Field.Error>
    </Field.Root>
  ),
};

export const GroupedItems: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field.Root name="notifications">
      <Field.Label>Notifications</Field.Label>
      <RadioGroup defaultValue="important">
        <Field.Item>
          <Field.Label>Important updates</Field.Label>
          <Radio value="important" />
          <Field.Description>
            Only messages that need your attention
          </Field.Description>
        </Field.Item>
        <Field.Item>
          <Field.Label>All updates</Field.Label>
          <Radio value="all" />
          <Field.Description>Every change to your records</Field.Description>
        </Field.Item>
        <Field.Item disabled>
          <Field.Label>Daily digest</Field.Label>
          <Radio value="digest" />
          <Field.Description>Coming soon</Field.Description>
        </Field.Item>
      </RadioGroup>
    </Field.Root>
  ),
};

type FieldCatalogState = 'default' | 'invalid' | 'disabled';
type FieldCatalogHelper = 'description' | 'error';

export const Catalog: CatalogStory<Story, typeof Field.Root> = {
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: [
            'default',
            'invalid',
            'disabled',
          ] satisfies FieldCatalogState[],
          props: (state: FieldCatalogState) => ({
            disabled: state === 'disabled',
            invalid: state === 'invalid',
          }),
        },
        {
          name: 'helper',
          values: ['description', 'error'] satisfies FieldCatalogHelper[],
          props: (helper: FieldCatalogHelper) => ({
            children: (
              <>
                <Field.Label>Label</Field.Label>
                {helper === 'error' ? (
                  <Field.Error match>This field is required</Field.Error>
                ) : (
                  <Field.Description>This is a hint</Field.Description>
                )}
              </>
            ),
          }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: CatalogStory<Story, typeof Field.Root> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
