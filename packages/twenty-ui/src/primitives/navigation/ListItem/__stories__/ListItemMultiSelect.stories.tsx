import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconBell } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';
import { ListItem } from '../ListItem';

const meta: Meta<typeof ListItem> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemMultiSelect',
  component: ListItem,
  args: {
    role: 'option',
    'aria-selected': false,
    indicator: 'checkbox',
    startIcon: <IconBell />,
    children: 'First option',
  },
};

export default meta;
type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  decorators: [
    ComponentDecorator,
    (Story) => (
      <div role="listbox" aria-label="Options">
        <Story />
      </div>
    ),
  ],
  parameters: { container: { width: 240 } },
};

export const Catalog: CatalogStory<Story, typeof ListItem> = {
  decorators: [
    CatalogDecorator,
    (Story) => (
      <div role="listbox" aria-label="Options">
        <Story />
      </div>
    ),
  ],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'selected',
          values: [false, true],
          props: (selected: boolean) => ({
            selected,
            'aria-selected': selected,
          }),
        },
        {
          name: 'state',
          values: ['default', 'focused', 'disabled'],
          props: (state: string) => ({
            focused: state === 'focused',
            disabled: state === 'disabled',
          }),
        },
      ],
      options: { elementContainer: { style: { width: 180 } } },
    },
  },
};

export const CatalogDark: CatalogStory<Story, typeof ListItem> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
