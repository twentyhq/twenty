import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';
import { expect, userEvent, within } from 'storybook/test';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconBell, IconEdit, IconSettings, IconTrash } from '@ui/icon';
import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { type ListItemColor } from '@ui/primitives/navigation/ListItem/types/ListItemColor';
import { type ListItemIndicator } from '@ui/primitives/navigation/ListItem/types/ListItemIndicator';
import { type ListItemProps } from '@ui/primitives/navigation/ListItem/types/ListItemProps';

const meta: Meta<typeof ListItem> = {
  title: 'UI/Navigation/ListItem',
  component: ListItem,
  args: { children: 'List item' },
};

export default meta;

type Story = StoryObj<typeof ListItem>;

const START_ICON = <IconBell />;

const ACTIONS = (
  <>
    <LightIconButton aria-label="Edit" onClick={action('Edit')}>
      <IconEdit />
    </LightIconButton>
    <LightIconButton aria-label="Delete" onClick={action('Delete')}>
      <IconTrash />
    </LightIconButton>
  </>
);

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { startIcon: START_ICON },
};

export const OverflowingLabel: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 160 } },
  args: { children: 'A workspace preference with a long label' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const label = canvas.getByText('A workspace preference with a long label');

    await userEvent.hover(label);

    expect(await page.findByRole('tooltip')).toHaveTextContent(
      'A workspace preference with a long label',
    );
  },
};

export const WithDescription: Story = {
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 240 },
  },
  args: { startIcon: START_ICON, description: 'Description' },
};

export const WithActions: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { startIcon: START_ICON, actions: ACTIONS },
};

export const WithCheckbox: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { indicator: 'checkbox', selected: true },
};

type ListItemCatalogState =
  | 'default'
  | 'hover'
  | 'highlighted'
  | 'selected'
  | 'disabled';

const LIST_ITEM_CATALOG_STATE_PROPS: Record<
  ListItemCatalogState,
  Partial<ListItemProps>
> = {
  default: {},
  hover: { className: 'hover' },
  highlighted: { focused: true },
  selected: { selected: true },
  disabled: { disabled: true },
};

export const Catalog: CatalogStory<Story, typeof ListItem> = {
  args: { startIcon: START_ICON },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
        {
          name: 'color',
          values: ['neutral', 'danger'] satisfies ListItemColor[],
          props: (color: ListItemColor) => ({ color }),
        },
        {
          name: 'state',
          values: [
            'default',
            'hover',
            'highlighted',
            'selected',
            'disabled',
          ] satisfies ListItemCatalogState[],
          props: (state: ListItemCatalogState) =>
            LIST_ITEM_CATALOG_STATE_PROPS[state],
        },
        {
          name: 'indicator',
          values: ['none', 'check', 'checkbox'] satisfies ListItemIndicator[],
          props: (indicator: ListItemIndicator) => ({ indicator }),
        },
      ],
      options: {
        elementContainer: { style: { width: 180 } },
      },
    },
  },
  decorators: [CatalogDecorator],
};

type ListItemCatalogSlot =
  | 'startIcon'
  | 'endIcon'
  | 'description'
  | 'endDescription'
  | 'hotkeys'
  | 'actions'
  | 'submenu';

const LIST_ITEM_CATALOG_SLOT_PROPS: Record<
  ListItemCatalogSlot,
  Partial<ListItemProps>
> = {
  startIcon: { startIcon: START_ICON },
  endIcon: { endIcon: <IconSettings /> },
  description: { description: 'Description' },
  endDescription: { description: '3 selected', descriptionPlacement: 'end' },
  hotkeys: { hotkeys: ['⌘', 'K'] },
  actions: { actions: ACTIONS },
  submenu: { hasSubmenu: true },
};

export const SlotsCatalog: CatalogStory<Story, typeof ListItem> = {
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'] },
    catalog: {
      dimensions: [
        {
          name: 'state',
          values: ['default', 'hover'] satisfies ListItemCatalogState[],
          props: (state: ListItemCatalogState) =>
            LIST_ITEM_CATALOG_STATE_PROPS[state],
        },
        {
          name: 'slot',
          values: [
            'startIcon',
            'endIcon',
            'description',
            'endDescription',
            'hotkeys',
            'actions',
            'submenu',
          ] satisfies ListItemCatalogSlot[],
          props: (slot: ListItemCatalogSlot) =>
            LIST_ITEM_CATALOG_SLOT_PROPS[slot],
        },
      ],
      options: {
        elementContainer: { style: { width: 180 } },
      },
    },
  },
  decorators: [CatalogDecorator],
};

export const CatalogDark: CatalogStory<Story, typeof ListItem> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
