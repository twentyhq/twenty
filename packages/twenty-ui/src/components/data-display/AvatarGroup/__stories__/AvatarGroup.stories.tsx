import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { type AvatarProps } from '@ui/primitives/data-display/Avatar/types/AvatarProps';
import { type AvatarShape } from '@ui/primitives/data-display/Avatar/types/AvatarShape';
import { type AvatarSize } from '@ui/primitives/data-display/Avatar/types/AvatarSize';
import { Button } from '@ui/primitives/input/Button/Button';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  AVATAR_URL_MOCK,
  CatalogDecorator,
  ComponentDecorator,
} from '@ui/testing';

import { AvatarGroup } from '@ui/components/data-display/AvatarGroup/AvatarGroup';
import { type AvatarGroupProps } from '@ui/components/data-display/AvatarGroup/types/AvatarGroupProps';

const makeAvatar = ({
  userName,
  props = {},
}: {
  userName: string;
  props?: Partial<AvatarProps>;
}) => (
  <Avatar
    key={userName}
    name={userName}
    colorSeed={userName}
    role="img"
    aria-label={userName}
    {...props}
  />
);

const getAvatars = (commonProps: Partial<AvatarProps> = {}) => [
  makeAvatar({
    userName: 'Matthew',
    props: { src: AVATAR_URL_MOCK, ...commonProps },
  }),
  ...['Sophie', 'Jane', 'Lily', 'John', 'Oliver', 'Emma', 'Noah'].map(
    (userName) => makeAvatar({ userName, props: commonProps }),
  ),
];

const meta: Meta<
  AvatarGroupProps & AvatarProps & { numberOfAvatars?: number }
> = {
  id: 'ui-data-display-avatargroup',
  title: 'UI/Components/Data display/AvatarGroup',
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

export const WithDerivedOverflow: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <AvatarGroup
      avatars={getAvatars({ shape: 'circle' })}
      maxVisible={3}
      overflowShape="circle"
      overlap="left"
      overlapOffset="4px"
    />
  ),
};

export const PartiallyLoaded: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <AvatarGroup
      avatars={getAvatars({ shape: 'circle' }).slice(0, 3)}
      maxVisible={3}
      total={20}
      overflowShape="circle"
    />
  ),
};

export const CustomOverflow: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <AvatarGroup
      avatars={getAvatars({ shape: 'circle' })}
      maxVisible={3}
      renderOverflow={(hiddenCount) => (
        <Button size="sm" variant="ghost">
          {hiddenCount} more members
        </Button>
      )}
    />
  ),
};

export const WithRing: Story = {
  decorators: [ComponentDecorator],
  render: () => (
    <AvatarGroup
      avatars={getAvatars({ shape: 'circle', size: 'lg', ring: true }).slice(
        0,
        5,
      )}
      maxVisible={5}
      overlap="left"
      overlapOffset="4px"
    />
  ),
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
