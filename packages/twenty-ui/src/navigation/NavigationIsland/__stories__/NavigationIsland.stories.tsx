import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconList, IconMessageCirclePlus, IconSearch } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';

import { NavigationIsland } from '@ui/navigation/NavigationIsland/NavigationIsland';

const meta: Meta<typeof NavigationIsland> = {
  title: 'UI/Navigation/NavigationIsland/NavigationIsland',
  component: NavigationIsland,
  decorators: [ComponentDecorator],
  args: {
    activeItemName: 'menu',
    items: [
      { name: 'menu', label: 'Menu', Icon: IconList, onClick: () => {} },
      { name: 'search', label: 'Search', Icon: IconSearch, onClick: () => {} },
      {
        name: 'newAiChat',
        label: 'AI chat',
        Icon: IconMessageCirclePlus,
        onClick: () => {},
      },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof NavigationIsland>;

export const Default: Story = {};

export const SearchActive: Story = {
  args: { activeItemName: 'search' },
};

export const WithoutAi: Story = {
  args: {
    items: [
      { name: 'menu', label: 'Menu', Icon: IconList, onClick: () => {} },
      { name: 'search', label: 'Search', Icon: IconSearch, onClick: () => {} },
    ],
  },
};
