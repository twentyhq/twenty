import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Avatar, type AvatarProps } from '@ui/data-display/Avatar/Avatar';
import { type AvatarSize } from '@ui/data-display/Avatar/types/AvatarSize';
import { type AvatarType } from '@ui/data-display/Avatar/types/AvatarType';
import {
  AVATAR_URL_MOCK,
  CatalogDecorator,
  ComponentDecorator,
  JotaiRootDecorator,
} from '@ui/testing';

import {
  AvatarGroup,
  type AvatarGroupProps,
} from '@ui/data-display/AvatarGroup/AvatarGroup';

const makeAvatar = (userName: string, props: Partial<AvatarProps> = {}) => (
  // oxlint-disable-next-line react/jsx-props-no-spreading
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
  title: 'UI/Data Display/AvatarGroup',
  component: AvatarGroup,
  render: ({ numberOfAvatars = 5, ...args }) => (
    <AvatarGroup avatars={getAvatars(args).slice(0, numberOfAvatars)} />
  ),
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {
  decorators: [ComponentDecorator, JotaiRootDecorator],
};

export const Catalog: Story = {
  parameters: {
    // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
    a11y: { test: 'todo' },
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
  decorators: [CatalogDecorator, JotaiRootDecorator],
};
