import { type Meta, type StoryObj } from '@storybook/react-vite';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import {
  Checkbox,
  CheckboxAccent,
  CheckboxShape,
  CheckboxSize,
  CheckboxVariant,
} from '@ui/input/Checkbox/Checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'UI/Input/Checkbox/Checkbox',
  component: Checkbox,
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: {
    checked: false,
    indeterminate: false,
    hoverable: false,
    disabled: false,
    variant: CheckboxVariant.Primary,
    size: CheckboxSize.Small,
    shape: CheckboxShape.Squared,
    accent: CheckboxAccent.Blue,
    'aria-label': 'Checkbox',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Checkbox> = {
  args: { 'aria-label': 'Checkbox' },
  argTypes: {
    variant: { control: false },
    size: { control: false },
    indeterminate: { control: false },
    checked: { control: false },
    hoverable: { control: false },
    shape: { control: false },
    accent: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: ['disabled', 'unchecked', 'checked', 'indeterminate'],
          props: (state: string) => {
            if (state === 'disabled') {
              return { disabled: true };
            }
            if (state === 'checked') {
              return { checked: true };
            }
            if (state === 'indeterminate') {
              return { indeterminate: true };
            }
            return {};
          },
        },
        {
          name: 'shape',
          values: Object.values(CheckboxShape),
          props: (shape: CheckboxShape) => ({ shape }),
        },
        {
          name: 'isHoverable',
          values: ['default', 'hoverable'],
          props: (isHoverable: string) => {
            if (isHoverable === 'hoverable') {
              return { hoverable: true };
            }
            return {};
          },
        },
        {
          name: 'size',
          values: Object.values(CheckboxSize),
          props: (size: CheckboxSize) => ({ size }),
        },
        {
          name: 'accent',
          values: Object.values(CheckboxAccent),
          props: (accent: CheckboxAccent) => ({ accent }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
