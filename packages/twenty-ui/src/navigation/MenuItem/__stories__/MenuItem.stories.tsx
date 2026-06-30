import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { IconBell } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type MenuItemAccent } from '@ui/navigation/MenuItem/types/MenuItemAccent';
import { MenuItem } from '@ui/navigation/MenuItem/MenuItem';

const meta: Meta<typeof MenuItem> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItem',
  component: MenuItem,
};

export default meta;

type Story = StoryObj<typeof MenuItem>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    text: 'Menu item text',
    LeftIcon: IconBell,
    accent: 'default',
    iconButtons: [
      { Icon: IconBell, onClick: action('Clicked'), ariaLabel: 'Notify' },
      { Icon: IconBell, onClick: action('Clicked'), ariaLabel: 'Notify' },
    ],
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItem> = {
  args: { ...Default.args },
  argTypes: {
    accent: { control: false },
    className: { control: false },
    iconButtons: { control: false },
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
          name: 'accents',
          values: ['default', 'danger'] satisfies MenuItemAccent[],
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
          values: ['no icon button', 'two icon buttons'],
          props: (choice: string) => {
            switch (choice) {
              case 'no icon button': {
                return {
                  iconButtons: [],
                };
              }
              case 'two icon buttons': {
                return {
                  iconButtons: [
                    {
                      Icon: IconBell,
                      onClick: action('Clicked on first icon button'),
                      ariaLabel: 'Notify',
                    },
                    {
                      Icon: IconBell,
                      onClick: action('Clicked on second icon button'),
                      ariaLabel: 'Notify',
                    },
                  ],
                };
              }
              default:
                return {};
            }
          },
        },
        {
          name: 'disabled',
          values: [true, false],
          props: (disabled: boolean) => ({ disabled }),
        },
      ],
      options: {
        elementContainer: {
          width: 200,
        },
      },
    },
  },
  decorators: [CatalogDecorator],
};

export const HotKeysCatalog: CatalogStory<Story, typeof MenuItem> = {
  args: {
    text: 'Menu item with hotkeys',
    LeftIcon: IconBell,
    hotKeys: ['⌘', 'K'],
  },
  argTypes: {
    className: { control: false },
    iconButtons: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'hotKeyTypes',
          values: ['no hotkeys', 'single key', 'modifier + key'],
          props: (choice: string) => {
            switch (choice) {
              case 'no hotkeys':
                return { hotKeys: undefined };
              case 'single key':
                return { hotKeys: ['K'] };
              case 'modifier + key':
                return { hotKeys: ['⌘', 'K'] };
              default:
                return {};
            }
          },
          labels: (choice: string) => {
            switch (choice) {
              case 'no hotkeys':
                return 'No hotkeys';
              case 'single key':
                return 'Single key (K)';
              case 'modifier + key':
                return 'Modifier + key (⌘K)';
              default:
                return choice;
            }
          },
        },
        {
          name: 'states',
          values: ['default', 'hover'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: 'hover' };
              default:
                return {};
            }
          },
        },
      ],
      options: {
        elementContainer: {
          width: 300,
        },
      },
    },
  },
  decorators: [CatalogDecorator],
};

export const ContextualTextCatalog: CatalogStory<Story, typeof MenuItem> = {
  args: {
    text: 'Menu item with contextual text',
  },
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'contextualTextPosition',
          values: ['left', 'right'],
          props: (contextualTextPosition: 'left' | 'right') => ({
            contextualTextPosition,
          }),
          labels: (contextualTextPosition: 'left' | 'right') =>
            contextualTextPosition === 'left' ? 'Left' : 'Right',
        },
        {
          name: 'contextualText',
          values: [
            'Contextual text',
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, corporis.',
          ],
          props: (contextualText: string) => ({ contextualText }),
          labels: (contextualText: string) => {
            switch (contextualText) {
              case 'Contextual text':
                return 'Contextual text';
              case 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, corporis.':
                return 'Long contextual text';
              default:
                return contextualText;
            }
          },
        },
        {
          name: 'iconButtons',
          values: ['no icon button', 'one icon button'],
          props: (choice: string) => {
            switch (choice) {
              case 'no icon button': {
                return {
                  iconButtons: [],
                };
              }
              case 'one icon button': {
                return {
                  iconButtons: [
                    {
                      Icon: IconBell,
                      onClick: action('Clicked on icon button'),
                      ariaLabel: 'Notify',
                    },
                  ],
                };
              }
              default:
                return {};
            }
          },
          labels: (choice: string) => {
            switch (choice) {
              case 'no icon button':
                return 'No icon button';
              case 'one icon button':
                return 'One icon button';
              default:
                return choice;
            }
          },
        },
        {
          name: 'states',
          values: ['default', 'hover'],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: 'hover' };
              default:
                return {};
            }
          },
        },
      ],
      options: {
        elementContainer: {
          style: { width: '400px', overflow: 'hidden' },
        },
      },
    },
  },
};

export const SubMenuCatalog: CatalogStory<Story, typeof MenuItem> = {
  args: {
    text: 'Menu item with sub menu',
    LeftIcon: IconBell,
    hasSubMenu: true,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'isSubMenuOpened',
          values: [true, false],
          props: (isSubMenuOpened: boolean) => ({ isSubMenuOpened }),
          labels: (isSubMenuOpened: boolean) =>
            isSubMenuOpened ? 'Opened' : 'Closed',
        },
      ],
      options: {
        elementContainer: {
          width: 200,
        },
      },
    },
  },
  decorators: [CatalogDecorator],
};
