import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Avatar } from '@ui/primitives/data-display';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';
import { ListItem } from '../ListItem';

const meta: Meta<typeof ListItem> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemMultiSelectAvatar',
  component: ListItem,
  args: {
    role: 'option',
    'aria-selected': false,
    indicator: 'checkbox',
    startIcon: <Avatar name="Alex Morgan" size="md" />,
    children: 'Alex Morgan',
    description: 'Person',
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
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST, container: { width: 240 } },
};

export const ClickingCheckboxSelectsOnce: Story = {
  ...Default,
  args: { onClick: fn() },
  play: async ({ canvasElement, args }) => {
    const row = within(canvasElement).getByRole('option');
    const indicator = row.querySelector('span[aria-hidden="true"]');

    await expect(indicator).not.toBeNull();
    await userEvent.click(indicator as HTMLElement);
    await expect(args.onClick).toHaveBeenCalledTimes(1);
  },
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
