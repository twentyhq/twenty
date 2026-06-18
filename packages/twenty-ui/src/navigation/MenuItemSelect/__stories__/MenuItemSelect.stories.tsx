import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
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
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    text: 'First option',
    LeftIcon: IconBell,
  },
  argTypes: {
    className: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemSelect> = {
  args: { LeftIcon: IconBell, text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
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
  decorators: [CatalogDecorator],
};
