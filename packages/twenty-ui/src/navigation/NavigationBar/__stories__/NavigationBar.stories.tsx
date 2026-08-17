import { type Meta, type StoryObj } from '@storybook/react-vite';
import { IconHome, IconSearch, IconSettings } from '@ui/icon';
import { ComponentDecorator } from '@ui/testing';
import { expect, fn, userEvent, within } from 'storybook/test';

import { NavigationBar } from '@ui/navigation/NavigationBar/NavigationBar';

const meta: Meta<typeof NavigationBar> = {
  title: 'UI/Navigation/NavigationBar/NavigationBar',
  component: NavigationBar,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof NavigationBar>;

const getItems = (onSearchClick: () => void) => [
  { name: 'Home', label: 'Home', Icon: IconHome, onClick: () => {} },
  { name: 'Search', label: 'Search', Icon: IconSearch, onClick: onSearchClick },
  {
    name: 'Settings',
    label: 'Settings',
    Icon: IconSettings,
    onClick: () => {},
  },
];

export const Default: Story = {
  args: {
    activeItemName: 'Home',
    items: getItems(fn()),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    const home = canvas.getByRole('button', { name: 'Home' });
    expect(home).toHaveAttribute('aria-pressed', 'true');

    const search = canvas.getByRole('button', { name: 'Search' });
    expect(search).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(search);
    expect(args.items[1].onClick).toHaveBeenCalled();
  },
};

export const Hidden: Story = {
  args: {
    activeItemName: 'Home',
    isHidden: true,
    items: getItems(fn()),
  },
  play: async ({ canvasElement }) => {
    const navigationBar = canvasElement.querySelector('nav');

    expect(navigationBar).toHaveAttribute('aria-hidden', 'true');
    expect(navigationBar).toHaveAttribute('data-hidden');
    expect(navigationBar).not.toBeVisible();
  },
};
