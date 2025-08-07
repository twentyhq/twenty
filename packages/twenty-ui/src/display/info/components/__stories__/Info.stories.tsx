import { type Meta, type StoryObj } from '@storybook/react';
import {
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Info, type InfoAccent } from '../Info';

const meta: Meta<typeof Info> = {
  title: 'UI/Display/Info',
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
