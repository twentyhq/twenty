import { Meta, StoryObj } from '@storybook/react';

import { CatalogDecorator } from '../../../../testing/decorators/CatalogDecorator';
import { ComponentDecorator } from '../../../../testing/decorators/ComponentDecorator';
import { CatalogStory } from '../../../../testing/types';
import { Info, InfoAccent } from '../Info';

const meta: Meta<typeof Info> = {
  title: 'UI/Display/Info/Info',
  component: Info,
};

export default meta;
type Story = StoryObj<typeof Info>;

export const Default: Story = {
  args: {
    accent: 'blue',
    text: 'An info component',
    buttonTitle: 'Update',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof Info> = {
  args: {
    text: 'An info component',
    buttonTitle: 'Update',
  },
  argTypes: {
    accent: { control: false },
  },
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'accents',
          values: ['blue', 'danger'] satisfies InfoAccent[],
          props: (accent: InfoAccent) => ({ accent }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
