import { type Meta, type StoryObj } from '@storybook/react-vite';
import { UndecoratedLink } from '@ui/navigation/UndecoratedLink/UndecoratedLink';
import { ComponentWithRouterDecorator } from '@ui/testing';
import { expect, userEvent, within } from 'storybook/test';

const meta: Meta<typeof UndecoratedLink> = {
  title: 'UI/Navigation/UndecoratedLink',
  component: UndecoratedLink,
  decorators: [ComponentWithRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof UndecoratedLink>;

export const Default: Story = {
  args: {
    children: 'Go Home',
    to: '/home',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const link = canvas.getByText('Go Home');

    await userEvent.click(link);

    const href = link.getAttribute('href');
    expect(href).toBe('/home');
  },
};
