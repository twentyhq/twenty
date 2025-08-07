import { type Meta, type StoryObj } from '@storybook/react';

import { CatalogDecorator } from '@ui/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';
import { type CatalogStory } from '@ui/testing/types/CatalogStory';

import { H1Title, H1TitleFontColor } from '../H1Title';

const meta: Meta<typeof H1Title> = {
  title: 'UI/Display/Typography/Title/H1Title',
  component: H1Title,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof H1Title>;

const args = {
  title: 'Title',
  fontColor: H1TitleFontColor.Primary,
};

export const Default: Story = {
  args,
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof H1Title> = {
  args,
  decorators: [CatalogDecorator],
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'FontColor',
          values: Object.values(H1TitleFontColor),
          props: (fontColor: H1TitleFontColor) => ({ fontColor }),
        },
      ],
    },
  },
};
