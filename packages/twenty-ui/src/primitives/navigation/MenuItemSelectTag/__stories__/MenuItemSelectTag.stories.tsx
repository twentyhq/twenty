import { expect, within } from 'storybook/test';
import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type ThemeColor } from '@ui/theme';
import { MenuItemSelectTag } from '@ui/primitives/navigation/MenuItemSelectTag/MenuItemSelectTag';

const meta: Meta<typeof MenuItemSelectTag> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemSelectTag',
  component: MenuItemSelectTag,
};

export default meta;

type Story = StoryObj<typeof MenuItemSelectTag>;

export const Default: Story = {
  args: {
    selected: false,
    onClick: undefined,
    text: 'Item A',
  },
  argTypes: {
    selected: {
      control: 'boolean',
      defaultValue: false,
    },
    onClick: {
      control: false,
    },
  },
  decorators: [
    (Story) => (
      <div role="listbox" aria-label="Options">
        <Story />
      </div>
    ),
    ComponentDecorator,
  ],
};

export const Catalog: CatalogStory<Story, typeof MenuItemSelectTag> = {
  args: {
    text: 'Item A',
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: {
      hover: ['.hover'],
      active: ['.pressed'],
      focus: ['.focus'],
    },
    catalog: {
      dimensions: [
        {
          name: 'color',
          values: [
            'green',
            'turquoise',
            'sky',
            'blue',
            'purple',
            'pink',
            'red',
            'orange',
            'yellow',
            'gray',
          ],
          props: (color: ThemeColor) => ({ color }),
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
          labels: (state: string) => `State: ${state}`,
        },
      ] as CatalogDimension[],
      options: {
        elementContainer: { width: 200 },
      } as CatalogOptions,
    },
  },
  decorators: [
    (Story) => (
      <div role="listbox" aria-label="Options">
        <Story />
      </div>
    ),
    CatalogDecorator,
  ],
};

export const Selected: Story = {
  args: {
    color: 'green',
    selected: true,
    text: 'Selected option',
  },
  decorators: [
    (Story) => (
      <div role="listbox" aria-label="Options">
        <Story />
      </div>
    ),
    ComponentDecorator,
  ],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole('option', {
        name: 'Selected option',
        selected: true,
      }),
    ).toBeVisible();
  },
};
