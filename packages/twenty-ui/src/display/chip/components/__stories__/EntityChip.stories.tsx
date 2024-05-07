import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator, RouterDecorator } from '@ui/testing';

import { EntityChip } from '../EntityChip';

const meta: Meta<typeof EntityChip> = {
  title: 'UI/Display/Chip/EntityChip',
  component: EntityChip,
  decorators: [RouterDecorator, ComponentDecorator],
  args: {
    name: 'Entity name',
    linkToEntity: '/entity-link',
    avatarType: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof EntityChip>;

export const Default: Story = {};
