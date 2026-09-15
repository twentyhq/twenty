import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Field } from '@ui/input/Field/Field';

const meta: Meta<typeof Field.Root> = {
  title: 'UI/Input/Field',
  component: Field.Root,
};

export default meta;

type Story = StoryObj<typeof Field.Root>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field.Root>
      <Field.Label>Label</Field.Label>
      <Field.Description>This is a hint</Field.Description>
    </Field.Root>
  ),
};

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
