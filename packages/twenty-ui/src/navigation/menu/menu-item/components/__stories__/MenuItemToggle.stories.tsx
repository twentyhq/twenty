import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconBell } from '@ui/display';
import {
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemToggle } from '../MenuItemToggle';

const meta: Meta<typeof MenuItemToggle> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemToggle',
  component: MenuItemToggle,
};

export default meta;

type Story = StoryObj<typeof MenuItemToggle>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: {
    text: 'First option',
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemToggle> = {
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
          name: 'toggled',
          values: [true, false],
          props: (toggled: boolean) => ({ toggled }),
          labels: (toggled: boolean) => (toggled ? 'Toggled' : 'Not toggled'),
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
      ] satisfies CatalogDimension[],
      options: {
        elementContainer: {
          width: 200,
        },
      } satisfies CatalogOptions,
    },
  },
  decorators: [CatalogDecorator],
};
