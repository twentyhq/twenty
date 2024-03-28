import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';

import { EntityChip } from '../EntityChip';

const meta: Meta<typeof EntityChip> = {
  title: 'UI/Display/Chip/EntityChip',
  component: EntityChip,
  decorators: [ComponentDecorator, RouterDecorator],
  args: {
    name: 'Entity name',
    linkToEntity: '/entity-link',
    avatarType: 'squared',
  },
};

export default meta;
type Story = StoryObj<typeof EntityChip>;

export const Default: Story = {};
