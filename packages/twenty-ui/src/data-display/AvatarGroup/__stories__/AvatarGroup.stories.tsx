import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { type AvatarProps } from '@ui/data-display/Avatar/types/AvatarProps';
import { type AvatarSize } from '@ui/data-display/Avatar/types/AvatarSize';
import { type AvatarShape } from '@ui/data-display/Avatar/types/AvatarShape';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  AVATAR_URL_MOCK,
  CatalogDecorator,
  ComponentDecorator,
} from '@ui/testing';

import {
  AvatarGroup,
  type AvatarGroupProps,
} from '@ui/data-display/AvatarGroup/AvatarGroup';

const makeAvatar = (userName: string, props: Partial<AvatarProps> = {}) => (
  <Avatar name={userName} colorSeed={userName} {...props} />
);

const getAvatars = (commonProps: Partial<AvatarProps> = {}) => [
  makeAvatar('Matthew', { src: AVATAR_URL_MOCK, ...commonProps }),
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
  decorators: [ComponentDecorator],
};

export const Catalog: Story = {
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    catalog: {
      dimensions: [
        {
          name: 'number of avatars',
          values: [1, 2, 3, 4, 5],
          props: (numberOfAvatars: number) => ({ numberOfAvatars }),
        },
        {
          name: 'types',
          values: ['circle', 'square'] as AvatarShape[],
          props: (shape: AvatarShape) => ({ shape }),
        },
        {
          name: 'sizes',
          values: ['xs', 'sm', 'md', 'lg', 'xl'] as AvatarSize[],
          props: (size: AvatarSize) => ({ size }),
        },
      ],
    },
  },
  decorators: [CatalogDecorator],
};
