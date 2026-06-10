import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { IconBell, IconMinus } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  ComponentDecorator,
} from '@ui/testing';
import { type MenuItemAccent } from '../../types/MenuItemAccent';
import { MenuItemDraggable } from '../MenuItemDraggable';

const meta: Meta<typeof MenuItemDraggable> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemDraggable',
  component: MenuItemDraggable,
};

export default meta;

type Story = StoryObj<typeof MenuItemDraggable>;

export const Default: Story = {
  args: {
    LeftIcon: IconBell,
    accent: 'default',
    iconButtons: [{ Icon: IconMinus, onClick: action('Clicked') }],
    onClick: action('Clicked'),
    text: 'Menu item draggable',
    isDragDisabled: false,
  },
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  args: { ...Default.args },
  argTypes: {
    accent: { control: false },
    iconButtons: { control: false },
  },
  parameters: {
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
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
          name: 'isDragDisabled',
          values: [true, false],
          props: (isDragDisabled: boolean) => ({
            isDragDisabled: isDragDisabled,
          }),
          labels: (isDragDisabled: boolean) =>
            isDragDisabled ? 'Without drag icon' : 'With drag icon',
        },
        {
          name: 'accents',
          values: ['default', 'danger', 'placeholder'] as MenuItemAccent[],
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
          values: ['no icon button', 'minus icon buttons'],
          props: (choice: string) => {
            switch (choice) {
              case 'no icon button': {
                return {
                  iconButtons: [],
                };
              }
              case 'minus icon buttons': {
                return {
                  iconButtons: [
                    {
                      Icon: IconMinus,
                      onClick: action('Clicked on minus icon button'),
                    },
                  ],
                };
              }
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

export const Grip: Story = {
  args: { ...Default.args, gripMode: 'always', isDragDisabled: false },
};

export const GripOnHover: Story = {
  args: { ...Default.args, gripMode: 'onHover', isDragDisabled: false },
};

export const GripOnHoverWithIconContainer: Story = {
  args: {
    ...Default.args,
    gripMode: 'onHover',
    withIconContainer: true,
    isDragDisabled: false,
  },
};

export const HoverDisabled: Story = {
  args: { ...Default.args, isHoverDisabled: true },
};
