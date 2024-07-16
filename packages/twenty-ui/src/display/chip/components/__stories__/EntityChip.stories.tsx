import { Meta, StoryObj } from '@storybook/react';
import { AvatarChip } from '@ui/display/chip/components/AvatarChip';

import { ComponentDecorator, RouterDecorator } from '@ui/testing';

const meta: Meta<typeof AvatarChip> = {
  title: 'UI/Display/Chip/AvatarChip',
  component: AvatarChip,
  decorators: [RouterDecorator, ComponentDecorator],
  args: {
    name: 'Entity name',
    avatarType: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof AvatarChip>;

export const Default: Story = {};
