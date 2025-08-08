import { type Meta, type StoryObj } from '@storybook/react';

import { CatalogDecorator } from '@ui/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { type CatalogStory } from '@ui/testing/types/CatalogStory';

import { Label, type LabelVariant } from '../Label';

const meta: Meta<typeof Label> = {
  title: 'UI/Display/Typography/Label',
  component: Label,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  args: {
    children: 'Label',
  },
};

export const Catalog: CatalogStory<Story, typeof Label> = {
  decorators: [CatalogDecorator],
  args: {
    children: 'Label',
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'Variant',
          values: ['default', 'small'] satisfies LabelVariant[],
          props: (variant: LabelVariant) => ({ variant }),
        },
      ],
    },
  },
};
