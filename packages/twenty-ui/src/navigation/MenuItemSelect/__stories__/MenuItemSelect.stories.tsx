import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemSelect } from '@ui/navigation/MenuItemSelect/MenuItemSelect';

import { IconBell } from '@ui/icon';
const meta: Meta<typeof MenuItemSelect> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemSelect',
  component: MenuItemSelect,
};

export default meta;

type Story = StoryObj<typeof MenuItemSelect>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    text: 'First option',
    LeftIcon: IconBell,
  },
  argTypes: {
    className: { control: false },
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

export const Catalog: CatalogStory<Story, typeof MenuItemSelect> = {
  args: { LeftIcon: IconBell, text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
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
          values: ['default', 'hover', 'focused', 'hover+focused'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: 'hover' };
              case 'focused':
                return { focused: true };
              case 'hover+focused':
                return { className: 'hover', focused: true };
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
  decorators: [
    (Story) => (
      <div role="listbox" aria-label="Options">
        <Story />
      </div>
    ),
    CatalogDecorator,
  ],
};
