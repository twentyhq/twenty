import { type Meta, type StoryObj } from '@storybook/react-vite';

import { CatalogDecorator } from '@ui/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing/a11yParameters';
import { type CatalogStory } from '@ui/testing/types/CatalogStory';

import { Label, type LabelVariant } from '@ui/typography/Label/Label';

const meta: Meta<typeof Label> = {
  title: 'UI/Typography/Label',
  component: Label,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
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
    a11y: A11Y_DEFER_COLOR_CONTRAST,
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
