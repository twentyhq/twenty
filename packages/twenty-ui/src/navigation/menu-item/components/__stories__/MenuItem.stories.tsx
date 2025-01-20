import { action } from '@storybook/addon-actions';
import { Meta, StoryObj } from '@storybook/react';

import { IconBell } from '@ui/display';
import {
  CatalogDecorator,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemAccent } from '../../types/MenuItemAccent';
import { MenuItem } from '../MenuItem';

const meta: Meta<typeof MenuItem> = {
  title: 'UI/Navigation/MenuItem/MenuItem',
  component: MenuItem,
};

export default meta;

type Story = StoryObj<typeof MenuItem>;

export const Default: Story = {
  args: {
    text: 'Menu item text',
    LeftIcon: IconBell,
    accent: 'default',
    iconButtons: [
      { Icon: IconBell, onClick: action('Clicked') },
      { Icon: IconBell, onClick: action('Clicked') },
    ],
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItem> = {
  args: { ...Default.args },
  argTypes: {
    accent: { control: false },
    className: { control: false },
    iconButtons: { control: false },
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
          name: 'accents',
          values: ['default', 'danger'] satisfies MenuItemAccent[],
          props: (accent: MenuItemAccent) => ({ accent }),
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
        {
          name: 'iconButtons',
          values: ['no icon button', 'two icon buttons'],
          props: (choice: string) => {
            switch (choice) {
              case 'no icon button': {
                return {
                  iconButtons: [],
                };
              }
              case 'two icon buttons': {
                return {
                  iconButtons: [
                    {
                      Icon: IconBell,
                      onClick: action('Clicked on first icon button'),
                    },
                    {
                      Icon: IconBell,
                      onClick: action('Clicked on second icon button'),
                    },
                  ],
                };
              }
              default:
                return {};
            }
          },
        },
        {
          name: 'disabled',
          values: [true, false],
          props: (disabled: boolean) => ({ disabled }),
        },
      ],
      options: {
        elementContainer: {
          width: 200,
        },
      },
    },
  },
  decorators: [CatalogDecorator],
};
