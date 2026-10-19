import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { expect, within } from 'storybook/test';

import { TintedIconTile } from '@ui/components/data-display/TintedIconTile/TintedIconTile';
import { type MenuItemAccent } from '@ui/components/navigation/MenuItem/types/MenuItemAccent';
import { MenuItemDraggable } from '@ui/components/navigation/MenuItemDraggable/MenuItemDraggable';
import { IconBell, IconMinus } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogDimension,
  type CatalogOptions,
} from '@ui/testing';

const meta: Meta<typeof MenuItemDraggable> = {
  id: 'ui-navigation-menu-menuitem-menuitemdraggable',
  title: 'UI/Components/Navigation/MenuItemDraggable',
  component: MenuItemDraggable,
};

export default meta;

type Story = StoryObj<typeof MenuItemDraggable>;

export const Display: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { text: 'Company name', gripMode: 'always' },
  decorators: [ComponentDecorator],
};

export const WithActions: Story = {
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
  args: { ...WithActions.args },
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
  args: { ...WithActions.args, gripMode: 'always', isDragDisabled: false },
};

export const GripOnHover: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...WithActions.args, gripMode: 'onHover', isDragDisabled: false },
};

export const GripOnHoverWithIconContainer: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    ...WithActions.args,
    gripMode: 'onHover',
    withIconContainer: true,
    isDragDisabled: false,
  },
};

export const GripOnHoverWithLeftComponent: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    ...WithActions.args,
    LeftIcon: undefined,
    LeftComponent: (
      <TintedIconTile
        icon={<IconBell size={16} />}
        color="blue"
        role="img"
        aria-label="Custom leading content"
      />
    ),
    gripMode: 'onHover',
    withIconContainer: true,
    isDragDisabled: false,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const leadingContent = canvas.getByRole('img', {
      name: 'Custom leading content',
    });
    const defaultSlot = canvasElement.querySelector('.grip-swap-default-icon');
    const grip = canvasElement.querySelector('.grip-swap-hover-icon');

    await expect(leadingContent).toBeVisible();
    await expect(defaultSlot).toContainElement(leadingContent);
    await expect(grip).toBeInTheDocument();
    await expect(grip!.querySelector('svg')).toBeInTheDocument();
    await expect(grip).toHaveStyle({ opacity: '0' });
  },
};

export const HoverDisabled: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { ...WithActions.args, isHoverDisabled: true },
};
