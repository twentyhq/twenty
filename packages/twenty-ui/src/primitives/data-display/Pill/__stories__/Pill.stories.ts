import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconCoins } from '@ui/icon';
import { Pill } from '@ui/primitives/data-display/Pill/Pill';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

const meta: Meta<typeof Pill> = {
  title: 'UI/Data Display/Pill',
  component: Pill,
  args: {
    label: 'Soon',
  },
};

export default meta;
type Story = StoryObj<typeof Pill>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export const Catalog: CatalogStory<Story, typeof Pill> = {
  args: { label: '+2', Icon: IconCoins },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'sizes',
          values: ['sm', 'md'],
          props: (size: 'sm' | 'md') => ({ size }),
        },
        {
          name: 'colors',
          values: ['tertiary', 'inherit'],
          props: (color: 'tertiary' | 'inherit') => ({ color }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
  play: async ({ canvasElement }) => {
    const pills = await within(canvasElement).findAllByText('+2');

    await expect(pills).toHaveLength(4);

    for (const pill of pills) {
      await expect(pill).toBeVisible();
    }
  },
};
