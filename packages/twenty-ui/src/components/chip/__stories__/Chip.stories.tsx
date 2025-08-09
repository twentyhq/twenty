import { type Meta, type StoryObj } from '@storybook/react';

import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Chip, ChipAccent, ChipSize, ChipVariant } from '../Chip';

const meta: Meta<typeof Chip> = {
  title: 'UI/Display/Chip/Chip',
  component: Chip,
};

export default meta;
type Story = StoryObj<typeof Chip>;

export const Default: Story = {
  args: {
    label: 'Chip test',
    size: ChipSize.Small,
    variant: ChipVariant.Highlighted,
    accent: ChipAccent.TextPrimary,
    disabled: false,
    clickable: true,
    maxWidth: 200,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Chip> = {
  args: { clickable: true, label: 'Hello' },
  argTypes: {
    size: { control: false },
    variant: { control: false },
    disabled: { control: false },
    className: { control: false },
    rightComponent: { control: false },
    leftComponent: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'states',
          values: ['default', 'hover', 'active', 'disabled'],
          props: (state: string) =>
            state === 'default' ? {} : { className: state },
        },
        {
          name: 'variants',
          values: Object.values(ChipVariant),
          props: (variant: ChipVariant) => ({ variant }),
        },
        {
          name: 'sizes',
          values: Object.values(ChipSize),
          props: (size: ChipSize) => ({ size }),
        },
        {
          name: 'accents',
          values: Object.values(ChipAccent),
          props: (accent: ChipAccent) => ({ accent }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
