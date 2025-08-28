import { type Meta, type StoryObj } from '@storybook/react';
import { IconBuildingSkyscraper, IconUser } from '@ui/display';
import { ComponentDecorator, RecoilRootDecorator } from '@ui/testing';
import { AvatarChip } from '../AvatarChip';

const meta: Meta<typeof AvatarChip> = {
  title: 'UI/Components/AvatarChip',
  component: AvatarChip,
  decorators: [ComponentDecorator, RecoilRootDecorator],
};

export default meta;
type Story = StoryObj<typeof AvatarChip>;

export const Default: Story = {
  args: {
    placeholder: 'JD',
    placeholderColorSeed: 'John Doe',
  },
};

export const WithAvatar: Story = {
  args: {
    avatarUrl: 'https://i.pravatar.cc/300',
    placeholder: 'JD',
    placeholderColorSeed: 'John Doe',
  },
};

export const WithIcon: Story = {
  args: {
    Icon: IconUser,
  },
};

export const WithIconBackground: Story = {
  args: {
    Icon: IconBuildingSkyscraper,
    isIconInverted: true,
  },
};

export const WithInvertedIcon: Story = {
  args: {
    Icon: IconUser,
    isIconInverted: true,
  },
};

export const WithRightDivider: Story = {
  args: {
    placeholder: 'JD',
    placeholderColorSeed: 'John Doe',
    divider: 'right',
  },
};

export const WithLeftDivider: Story = {
  args: {
    Icon: IconUser,
    divider: 'left',
  },
};

export const Clickable: Story = {
  args: {
    placeholder: 'JD',
    placeholderColorSeed: 'John Doe',
    onClick: () => alert('AvatarChip clicked'),
  },
};

export const ClickableIcon: Story = {
  args: {
    Icon: IconBuildingSkyscraper,
    isIconInverted: true,
    onClick: () => alert('Icon AvatarChip clicked'),
  },
};
