import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconBuildingSkyscraper, IconUser } from '@ui/display';
import { ComponentDecorator, JotaiRootDecorator } from '@ui/testing';
import { AvatarOrIcon } from '../AvatarOrIcon';

const meta: Meta<typeof AvatarOrIcon> = {
  title: 'UI/Components/AvatarOrIcon',
  component: AvatarOrIcon,
  decorators: [ComponentDecorator, JotaiRootDecorator],
};

export default meta;
type Story = StoryObj<typeof AvatarOrIcon>;

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

export const Clickable: Story = {
  args: {
    placeholder: 'JD',
    placeholderColorSeed: 'John Doe',
    onClick: () => alert('AvatarOrIcon clicked'),
  },
};

export const ClickableIcon: Story = {
  args: {
    Icon: IconBuildingSkyscraper,
    isIconInverted: true,
    onClick: () => alert('Icon AvatarOrIcon clicked'),
  },
};
