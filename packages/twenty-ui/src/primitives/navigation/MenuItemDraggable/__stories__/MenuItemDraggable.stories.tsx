import { LightIconButton } from '@ui/components/LightIconButton/LightIconButton';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { IconBell, IconMinus } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  ComponentDecorator,
} from '@ui/testing';
import { type MenuItemAccent } from '@ui/primitives/navigation/MenuItem/types/MenuItemAccent';
import { MenuItemDraggable } from '@ui/primitives/navigation/MenuItemDraggable/MenuItemDraggable';

const meta: Meta<typeof MenuItemDraggable> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemDraggable',
  component: MenuItemDraggable,
};

export default meta;

type Story = StoryObj<typeof MenuItemDraggable>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    LeftIcon: IconBell,
    accent: 'default',
    iconButtons: (
      <LightIconButton aria-label={'Remove'} onClick={action('Clicked')}>
        <IconMinus />
      </LightIconButton>
    ),
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
    a11y: A11Y_DEFER_COLOR_CONTRAST,
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
                  iconButtons: null,
                };
              }
              case 'minus icon buttons': {
                return {
                  iconButtons: (
                    <LightIconButton
                      aria-label={'Remove'}
                      onClick={action('Clicked on minus icon button')}
                    >
                      <IconMinus />
                    </LightIconButton>
                  ),
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
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...Default.args, gripMode: 'always', isDragDisabled: false },
};

export const GripOnHover: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...Default.args, gripMode: 'onHover', isDragDisabled: false },
};

export const GripOnHoverWithIconContainer: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    ...Default.args,
    gripMode: 'onHover',
    withIconContainer: true,
    isDragDisabled: false,
  },
};

export const HoverDisabled: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...Default.args, isHoverDisabled: true },
};
