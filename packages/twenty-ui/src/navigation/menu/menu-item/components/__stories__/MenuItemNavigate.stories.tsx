import { type Meta, type StoryObj } from '@storybook/react';

import { IconBell } from '@ui/display';
import { MenuItemNavigate } from '../MenuItemNavigate';

import {
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

const meta: Meta<typeof MenuItemNavigate> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemNavigate',
  component: MenuItemNavigate,
};

export default meta;

type Story = StoryObj<typeof MenuItemNavigate>;

export const Default: Story = {
  args: {
    text: 'First option',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemNavigate> = {
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
          name: 'withIconContainer',
          values: [true, false],
          props: (withIconContainer: boolean) => ({ withIconContainer }),
          labels: (withIconContainer: boolean) =>
            withIconContainer
              ? 'With icon container'
              : 'Without icon container',
        },
        {
          name: 'states',
          values: ['default', 'hover'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: state };
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
