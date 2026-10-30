import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconBuildingSkyscraper } from '@ui/icon';
import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { StackIcon } from '../StackIcon';

const meta = {
  title: 'UI/Components/Data display/StackIcon',
  component: StackIcon,
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    icon: <IconBuildingSkyscraper size={16} />,
    stackedIcon: (
      <Avatar size="xs" shape="square" variant="outline" name="Stripe" />
    ),
  },
} satisfies Meta<typeof StackIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = {
  render: (args) => (
    <Text style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <StackIcon {...args} />
      <Text>Companies</Text>
    </Text>
  ),
};

export const Geometry: Story = {
  ...Display,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvasElement.querySelector('svg')!;
    const root = icon.parentElement!.parentElement!;
    const label = canvas.getByText('Companies');
    const stackedAvatar = canvas.getByText('S');

    await expect(label).toBeVisible();
    await expect(root.getBoundingClientRect().width).toBe(16);
    await expect(root.getBoundingClientRect().height).toBe(16);
    await expect(icon.getBoundingClientRect().width).toBe(16);
    await expect(label.getBoundingClientRect().left).toBeGreaterThan(
      stackedAvatar.getBoundingClientRect().right,
    );
  },
};
