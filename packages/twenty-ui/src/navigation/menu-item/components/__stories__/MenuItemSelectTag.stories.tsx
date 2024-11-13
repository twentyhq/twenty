import { Meta, StoryObj } from '@storybook/react';

import {
  CatalogDecorator,
  CatalogDimension,
  CatalogOptions,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { ThemeColor } from '@ui/theme';
import { MenuItemSelectTag } from '../MenuItemSelectTag';

const meta: Meta<typeof MenuItemSelectTag> = {
  title: 'UI/Navigation/MenuItem/MenuItemSelectTag',
  component: MenuItemSelectTag,
};

export default meta;

type Story = StoryObj<typeof MenuItemSelectTag>;

export const Default: Story = {
  args: {
    selected: false,
    onClick: undefined,
    text: 'Item A',
  },
  argTypes: {
    selected: {
      control: 'boolean',
      defaultValue: false,
    },
    onClick: {
      control: false,
    },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemSelectTag> = {
  args: {
    text: 'Item A',
  },
  parameters: {
    pseudo: {
      hover: ['.hover'],
      active: ['.pressed'],
      focus: ['.focus'],
    },
    catalog: {
      dimensions: [
        {
          name: 'color',
          values: [
            'green',
            'turquoise',
            'sky',
            'blue',
            'purple',
            'pink',
            'red',
            'orange',
            'yellow',
            'gray',
          ],
          props: (color: ThemeColor) => ({ color }),
        },
        {
          name: 'states',
          values: ['default', 'hover', 'selected', 'hover+selected'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: 'hover' };
              case 'selected':
                return { selected: true };
              case 'hover+selected':
                return { className: 'hover', selected: true };
              default:
                return {};
            }
          },
          labels: (state: string) => `State: ${state}`,
        },
      ] as CatalogDimension[],
      options: {
        elementContainer: { width: 200 },
      } as CatalogOptions,
    },
  },
  decorators: [CatalogDecorator],
};
