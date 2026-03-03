import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconHome, IconSearch, IconSettings } from '@ui/display';
import { ComponentDecorator } from '@ui/testing';

import { NavigationBar } from '../NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'UI/Navigation/NavigationBar/NavigationBar',
  component: NavigationBar,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

export const Default: Story = {
  args: {
    activeItemName: 'Home',
    items: [
      { name: 'Home', Icon: IconHome, onClick: () => {} },
      { name: 'Search', Icon: IconSearch, onClick: () => {} },
      { name: 'Settings', Icon: IconSettings, onClick: () => {} },
    ],
  },
};
