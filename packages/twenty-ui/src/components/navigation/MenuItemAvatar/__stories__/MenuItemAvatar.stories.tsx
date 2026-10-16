import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';
import { MenuItemAvatar } from '../MenuItemAvatar';

const meta: Meta<typeof MenuItemAvatar> = {
  title: 'UI/Components/Navigation/MenuItemAvatar',
  component: MenuItemAvatar,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 280 } },
};

export default meta;
type Story = StoryObj<typeof MenuItemAvatar>;

export const Display: Story = {
  args: {
    text: 'Ada Lovelace',
    avatar: { name: 'Ada Lovelace', shape: 'circle' },
  },
};
