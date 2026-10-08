import { type Meta, type StoryObj } from '@storybook/react-vite';
import { Tag } from '@ui/primitives/data-display';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';
import { ListItem } from '../ListItem';

const meta: Meta<typeof ListItem> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemSelectTag',
  component: ListItem,
  args: {
    role: 'option',
    'aria-selected': false,
    indicator: 'check',
    children: <Tag color="blue">Qualified</Tag>,
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

export const Selected: Story = {
  ...Default,
  args: { selected: true, 'aria-selected': true },
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
