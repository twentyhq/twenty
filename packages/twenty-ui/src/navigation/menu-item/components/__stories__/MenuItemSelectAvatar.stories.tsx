import { Meta, StoryObj } from '@storybook/react';

import { Avatar } from '@ui/display';
import {
  AVATAR_URL_MOCK,
  CatalogDecorator,
  CatalogDimension,
  CatalogOptions,
  CatalogStory,
  ComponentDecorator,
} from '@ui/testing';
import { MenuItemSelectAvatar } from '../MenuItemSelectAvatar';

const meta: Meta<typeof MenuItemSelectAvatar> = {
  title: 'UI/Navigation/MenuItem/MenuItemSelectAvatar',
  component: MenuItemSelectAvatar,
};

export default meta;

type Story = StoryObj<typeof MenuItemSelectAvatar>;
export const Default: Story = {
  args: {
    text: 'First option',
    avatar: <Avatar avatarUrl={AVATAR_URL_MOCK} placeholder="L" />,
  },
  argTypes: {
    className: { control: false },
  },
  decorators: [ComponentDecorator],
};

export const Catalog: CatalogStory<Story, typeof MenuItemSelectAvatar> = {
  args: { text: 'Menu item' },
  argTypes: {
    className: { control: false },
  },
  parameters: {
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
              <Avatar avatarUrl={''} placeholder="L" />
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
  decorators: [CatalogDecorator],
};
