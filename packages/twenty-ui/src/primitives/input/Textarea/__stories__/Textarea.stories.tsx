import { type ComponentProps } from 'react';
import { Field } from '@ui/primitives/input';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Textarea } from '@ui/primitives/input/Textarea/Textarea';
import { type InputSize } from '@ui/primitives/input/types/InputSize';

const meta: Meta<typeof Textarea> = {
  title: 'UI/Input/Textarea',
  component: Textarea,
  args: {
    'aria-label': 'Textarea',
    placeholder: 'Placeholder',
  },
};

export default meta;

type Story = StoryObj<typeof Textarea>;

export const Display: Story = {
  args: { 'aria-label': undefined, placeholder: undefined },
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST, container: { width: 320 } },
  render: (args) => <TextareaDisplayExample {...args} />,
};

const TextareaDisplayExample = (props: ComponentProps<typeof Textarea>) => (
  <Field.Root name="notes">
    <Field.Label>Notes</Field.Label>
    <Textarea rows={4} defaultValue="Follow up next week." {...props} />
    <Field.Description>Add context for your team.</Field.Description>
  </Field.Root>
);

export const AutoResize: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { autoResize: true, rows: 1, maxRows: 4 },
};

type TextareaCatalogState = 'default' | 'focus' | 'invalid' | 'disabled';

const getTextareaCatalogStateProps = (state: TextareaCatalogState) => {
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

export const Catalog: CatalogStory<Story, typeof Textarea> = {
  args: { rows: 2 },
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
          ] satisfies TextareaCatalogState[],
          props: getTextareaCatalogStateProps,
        },
      ],
      options: {
        elementContainer: { style: { width: 160 } },
      },
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: CatalogStory<Story, typeof Textarea> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
