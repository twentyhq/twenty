import { Meta, StoryObj } from '@storybook/react';
import { AvatarChip } from '@ui/components/avatar-chip/AvatarChip';

import {
  ComponentDecorator,
  RecoilRootDecorator,
  RouterDecorator,
} from '@ui/testing';

const meta: Meta<typeof AvatarChip> = {
  title: 'UI/Display/Chip/AvatarChip',
  component: AvatarChip,
  decorators: [RouterDecorator, ComponentDecorator, RecoilRootDecorator],
  args: {
    name: 'Entity name',
    avatarType: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof AvatarChip>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    name: '',
  },
};
