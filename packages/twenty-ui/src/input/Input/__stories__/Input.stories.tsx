import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Field } from '@ui/input/Field/Field';
import { Input } from '@ui/input/Input/Input';
import { type InputSize } from '@ui/input/types/InputSize';

const meta: Meta<typeof Input> = {
  title: 'UI/Input/Input',
  component: Input,
  args: {
    'aria-label': 'Input',
    placeholder: 'Placeholder',
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
};

export const WithField: Story = {
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 240 },
  },
  render: () => (
    <Field.Root style={{ width: '100%' }}>
      <Field.Label>Email</Field.Label>
      <Input placeholder="you@example.com" />
      <Field.Description>We never share it</Field.Description>
    </Field.Root>
  ),
};

type InputCatalogState = 'default' | 'focus' | 'invalid' | 'disabled';

const getInputCatalogStateProps = (state: InputCatalogState) => {
  if (state === 'focus') {
    return { className: 'focus' };
  }

  if (state === 'invalid') {
    return { 'aria-invalid': true };
  }

  if (state === 'disabled') {
    return { disabled: true };
  }

  return {};
};

export const Catalog: CatalogStory<Story, typeof Input> = {
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'size',
          values: ['sm', 'md'] satisfies InputSize[],
          props: (size: InputSize) => ({ size }),
        },
        {
          name: 'state',
          values: [
            'default',
            'focus',
            'invalid',
            'disabled',
          ] satisfies InputCatalogState[],
          props: getInputCatalogStateProps,
        },
      ],
      options: {
        elementContainer: { style: { width: 160 } },
      },
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: CatalogStory<Story, typeof Input> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
