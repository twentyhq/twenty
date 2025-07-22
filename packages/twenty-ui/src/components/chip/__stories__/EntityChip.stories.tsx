import { Meta, StoryObj } from '@storybook/react';
import { AvatarIconChip } from '@ui/components/avatar-chip/AvatarIconChip';

import {
  ComponentDecorator,
  RecoilRootDecorator,
  RouterDecorator,
} from '@ui/testing';

const meta: Meta<typeof AvatarIconChip> = {
  title: 'UI/Display/Chip/AvatarChip',
  component: AvatarIconChip,
  decorators: [RouterDecorator, ComponentDecorator, RecoilRootDecorator],
  args: {
    name: 'Entity name',
    avatarType: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof AvatarIconChip>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    name: '',
  },
};
