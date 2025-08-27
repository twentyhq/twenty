import { type Meta, type StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { UndecoratedLink } from '@ui/navigation/link/components/UndecoratedLink';
import { ComponentWithRouterDecorator } from '@ui/testing';

const meta: Meta<typeof UndecoratedLink> = {
  title: 'UI/navigation/link/UndecoratedLink',
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
