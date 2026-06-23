import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Avatar } from '@ui/data-display';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  AVATAR_URL_MOCK,
  CatalogDecorator,
  type CatalogDimension,
  type CatalogOptions,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemSelectAvatar } from '@ui/navigation/MenuItemSelectAvatar/MenuItemSelectAvatar';

const meta: Meta<typeof MenuItemSelectAvatar> = {
  title: 'UI/Navigation/Menu/MenuItem/MenuItemSelectAvatar',
  component: MenuItemSelectAvatar,
};

export default meta;

type Story = StoryObj<typeof MenuItemSelectAvatar>;
export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    text: 'First option',
    contextualText: 'Contextual text',
    avatar: <Avatar avatarUrl={AVATAR_URL_MOCK} placeholder="L" />,
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

export const Catalog: CatalogStory<Story, typeof MenuItemSelectAvatar> = {
  args: { text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.pressed'], focus: ['.focus'] },
    catalog: {
      dimensions: [
        {
          name: 'withAvatar',
          values: [true, false],
          props: (withAvatar: boolean) => ({
            avatar: withAvatar ? (
              <Avatar avatarUrl={AVATAR_URL_MOCK} placeholder="L" />
            ) : (
              <Avatar avatarUrl="" placeholder="L" />
            ),
          }),
          labels: (withAvatar: boolean) =>
            withAvatar ? 'With avatar' : 'Without avatar',
        },
        {
          name: 'states',
          values: [
            'default',
            'hover',
            'disabled',
            'selected',
            'hover+selected',
          ],
          props: (state: string) => {
            switch (state) {
              case 'default':
                return {};
              case 'hover':
                return { className: 'hover' };
              case 'disabled':
                return { disabled: true };
              case 'selected':
                return { selected: true };

              case 'hover+selected':
                return { className: 'hover', selected: true };
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
