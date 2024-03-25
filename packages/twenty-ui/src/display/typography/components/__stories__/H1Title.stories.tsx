import { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from 'src/testing/decorators/CatalogDecorator';
import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { CatalogStory } from 'src/testing/types';

import { H1Title, H1TitleFontColor } from '../H1Title';

const meta: Meta<typeof H1Title> = {
  title: 'UI/Display/Typography/Title/H1Title',
  component: H1Title,
  args: {
    title: 'Title',
    fontColor: H1TitleFontColor.Primary,
  },
};

export default meta;

type Story = StoryObj<typeof H1Title>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof H1Title> = {
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
