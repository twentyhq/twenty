import { type Meta, type StoryObj } from '@storybook/react';

import { Avatar, type AvatarProps } from '@ui/display/avatar/components/Avatar';
import { type AvatarSize } from '@ui/display/avatar/types/AvatarSize';
import { type AvatarType } from '@ui/display/avatar/types/AvatarType';
import {
  AVATAR_URL_MOCK,
  CatalogDecorator,
  ComponentDecorator,
  RecoilRootDecorator,
} from '@ui/testing';

import { AvatarGroup, type AvatarGroupProps } from '../AvatarGroup';

const makeAvatar = (userName: string, props: Partial<AvatarProps> = {}) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <Avatar placeholder={userName} placeholderColorSeed={userName} {...props} />
);

const getAvatars = (commonProps: Partial<AvatarProps> = {}) => [
  makeAvatar('Matthew', { avatarUrl: AVATAR_URL_MOCK, ...commonProps }),
  makeAvatar('Sophie', commonProps),
  makeAvatar('Jane', commonProps),
  makeAvatar('Lily', commonProps),
  makeAvatar('John', commonProps),
];

const meta: Meta<
  AvatarGroupProps & AvatarProps & { numberOfAvatars?: number }
> = {
  title: 'Modules/Users/AvatarGroup',
  component: AvatarGroup,
  render: ({ numberOfAvatars = 5, ...args }) => (
    <AvatarGroup avatars={getAvatars(args).slice(0, numberOfAvatars)} />
  ),
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {
  decorators: [ComponentDecorator, RecoilRootDecorator],
};

export const Catalog: Story = {
  parameters: {
    catalog: {
      dimensions: [
        {
          name: 'number of avatars',
          values: [1, 2, 3, 4, 5],
          props: (numberOfAvatars: number) => ({ numberOfAvatars }),
        },
        {
          name: 'types',
          values: ['rounded', 'squared'] as AvatarType[],
          props: (type: AvatarType) => ({ type }),
        },
        {
          name: 'sizes',
          values: ['xs', 'sm', 'md', 'lg', 'xl'] as AvatarSize[],
          props: (size: AvatarSize) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator, RecoilRootDecorator],
};
