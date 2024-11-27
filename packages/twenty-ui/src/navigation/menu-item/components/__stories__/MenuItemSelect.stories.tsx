import { Meta, StoryObj } from '@storybook/react';

import {
  CatalogDecorator,
  CatalogDimension,
  CatalogOptions,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemSelect } from '../MenuItemSelect';

import { IconBell } from '@ui/display';
const meta: Meta<typeof MenuItemSelect> = {
  title: 'UI/Navigation/MenuItem/MenuItemSelect',
  component: MenuItemSelect,
};

export default meta;

type Story = StoryObj<typeof MenuItemSelect>;

export const Default: Story = {
  args: {
    text: 'First option',
    LeftIcon: IconBell,
  },
  argTypes: {
    className: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemSelect> = {
  args: { LeftIcon: IconBell, text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'withIcon',
          values: [true, false],
          props: (withIcon: boolean) => ({
            LeftIcon: withIcon ? IconBell : undefined,
          }),
          labels: (withIcon: boolean) =>
            withIcon ? 'With left icon' : 'Without left icon',
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
        },
      ] as CatalogDimension[],
      options: {
        elementContainer: {
          width: 200,
        },
      } as CatalogOptions,
    },
  },
  decorators: [CatalogDecorator],
};
