import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Textarea } from '@ui/input/Textarea/Textarea';
import { type InputSize } from '@ui/input/types/InputSize';

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

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { rows: 3 },
};

export const AutoResize: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { autoResize: true, rows: 1, maxRows: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByRole('textbox', { name: 'Textarea' });
    const initialHeight = textarea.clientHeight;

    await userEvent.type(textarea, 'one{enter}two{enter}three');

    await expect(textarea.clientHeight).toBeGreaterThan(initialHeight);

    await userEvent.type(
      textarea,
      '{enter}four{enter}five{enter}six{enter}seven{enter}eight',
    );

    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  },
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
