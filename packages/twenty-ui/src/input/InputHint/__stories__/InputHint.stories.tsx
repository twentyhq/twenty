import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { InputHint } from '@ui/input/InputHint/InputHint';

const meta: Meta<typeof InputHint> = {
  title: 'UI/Input/InputHint',
  component: InputHint,
  args: {
    children: 'This is a hint',
  },
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof InputHint>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export const Catalog: CatalogStory<Story, typeof InputHint> = {
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'danger',
          values: [false, true],
          props: (danger: boolean) => ({ danger }),
          labels: (danger: boolean) => (danger ? 'danger' : 'default'),
        },
      ],
    },
  },
};
