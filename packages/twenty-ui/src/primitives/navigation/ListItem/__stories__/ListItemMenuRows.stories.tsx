import { ButtonGroup } from '@ui/primitives/input/ButtonGroup/ButtonGroup';
import { Button } from '@ui/primitives/input/Button/Button';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { action } from 'storybook/actions';

import { IconBell } from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { type ListItemColor } from '../types/ListItemColor';
import { ListItem } from '../ListItem';

const meta: Meta<typeof ListItem> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItem',
  component: ListItem,
};

export default meta;

type Story = StoryObj<typeof ListItem>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    children: 'Menu item text',
    startIcon: <IconBell />,
    color: 'neutral',
    actions: (
      <ButtonGroup attached={false}>
        <Button
          variant="ghost"
          size="sm"
          aria-label={'Notify'}
          onClick={action('Clicked')}
        >
          <IconBell />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          aria-label={'Notify'}
          onClick={action('Clicked')}
        >
          <IconBell />
        </Button>
      </ButtonGroup>
    ),
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof ListItem> = {
  args: { ...Default.args },
  argTypes: {
    color: { control: false },
    className: { control: false },
    actions: { control: false },
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
            startIcon: withIcon ? <IconBell /> : undefined,
          }),
          labels: (withIcon: boolean) =>
            withIcon ? 'With left icon' : 'Without left icon',
        },
        {
          name: 'colors',
          values: ['neutral', 'danger'] satisfies ListItemColor[],
          props: (color: ListItemColor) => ({ color }),
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
          name: 'actions',
          values: ['no icon button', 'two icon buttons'],
          props: (choice: string) => {
            switch (choice) {
              case 'no icon button': {
                return {
                  actions: null,
                };
              }
              case 'two icon buttons': {
                return {
                  actions: (
                    <ButtonGroup attached={false}>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={'Notify'}
                        onClick={action('Clicked on first icon button')}
                      >
                        <IconBell />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={'Notify'}
                        onClick={action('Clicked on second icon button')}
                      >
                        <IconBell />
                      </Button>
                    </ButtonGroup>
                  ),
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

export const HotKeysCatalog: CatalogStory<Story, typeof ListItem> = {
  args: {
    children: 'Menu item with hotkeys',
    startIcon: <IconBell />,
    hotkeys: ['⌘', 'K'],
  },
  argTypes: {
    className: { control: false },
    actions: { control: false },
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
                return { hotkeys: undefined };
              case 'single key':
                return { hotkeys: ['K'] };
              case 'modifier + key':
                return { hotkeys: ['⌘', 'K'] };
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

export const ContextualTextCatalog: CatalogStory<Story, typeof ListItem> = {
  args: {
    children: 'Menu item with contextual text',
  },
  decorators: [CatalogDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'descriptionPlacement',
          values: ['inline', 'end'],
          props: (descriptionPlacement: 'inline' | 'end') => ({
            descriptionPlacement,
          }),
          labels: (descriptionPlacement: 'inline' | 'end') =>
            descriptionPlacement === 'inline' ? 'Left' : 'Right',
        },
        {
          name: 'description',
          values: [
            'Contextual text',
            'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, corporis.',
          ],
          props: (description: string) => ({ description }),
          labels: (description: string) => {
            switch (description) {
              case 'Contextual text':
                return 'Contextual text';
              case 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Eveniet, corporis.':
                return 'Long contextual text';
              default:
                return description;
            }
          },
        },
        {
          name: 'actions',
          values: ['no icon button', 'one icon button'],
          props: (choice: string) => {
            switch (choice) {
              case 'no icon button': {
                return {
                  actions: null,
                };
              }
              case 'one icon button': {
                return {
                  actions: (
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={'Notify'}
                      onClick={action('Clicked on icon button')}
                    >
                      <IconBell />
                    </Button>
                  ),
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

export const SubMenuCatalog: CatalogStory<Story, typeof ListItem> = {
  args: {
    children: 'Menu item with sub menu',
    startIcon: <IconBell />,
    hasSubmenu: true,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'submenuOpen',
          values: [true, false],
          props: (submenuOpen: boolean) => ({ submenuOpen }),
          labels: (submenuOpen: boolean) => (submenuOpen ? 'Opened' : 'Closed'),
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
