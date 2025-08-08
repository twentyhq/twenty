import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';
import { IconBuildingSkyscraper, IconUser } from '@ui/display';
import { MultipleAvatarChip } from '@ui/components';

const meta: Meta<typeof MultipleAvatarChip> = {
  title: 'UI/Components/MultipleAvatarChip',
  component: MultipleAvatarChip,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof MultipleAvatarChip>;

export const SingleIcon: Story = {
  args: {
    Icons: [<IconUser size={16} />],
    text: 'Person',
  },
};

export const MultipleIcons: Story = {
  args: {
    Icons: [<IconUser size={16} />, <IconBuildingSkyscraper size={16} />],
    text: 'Person & Company',
  },
};

export const IconsOnly: Story = {
  args: {
    Icons: [<IconUser size={16} />, <IconBuildingSkyscraper size={16} />],
  },
};
