import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { IconBuildingSkyscraper } from '@ui/icon';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { TintedIconTile } from '../TintedIconTile';

const meta = {
  title: 'UI/Components/Data display/TintedIconTile',
  component: TintedIconTile,
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { icon: <IconBuildingSkyscraper size={16} />, color: 'blue' },
} satisfies Meta<typeof TintedIconTile>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <>
      <TintedIconTile {...args} />
      <Text>Companies</Text>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const icon = canvasElement.querySelector('svg')!;
    const tile = icon.parentElement!.parentElement!;

    await expect(canvas.getByText('Companies')).toBeVisible();
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
    await expect(tile.getBoundingClientRect().width).toBe(16);
    await expect(tile.getBoundingClientRect().height).toBe(16);
    await expect(icon.getBoundingClientRect().width).toBe(16);
  },
};

export const CustomNode: Story = {
  args: {
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        role="img"
        aria-label="Internal artwork"
      >
        <path d="M2 2h16v16H2z" />
      </svg>
    ),
    role: 'img',
    'aria-label': 'Custom company tile',
    className: 'custom-tile',
    style: { width: 32, height: 32, borderRadius: 8 },
    render: <span data-composed="tile" />,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tile = canvas.getByRole('img', { name: 'Custom company tile' });

    await expect(tile.tagName).toBe('SPAN');
    await expect(tile).toHaveClass('custom-tile');
    await expect(tile).toHaveAttribute('data-composed', 'tile');
    await expect(tile.getBoundingClientRect().width).toBe(32);
    await expect(tile.getBoundingClientRect().height).toBe(32);
    await expect(tile.querySelector('svg')!.getBoundingClientRect().width).toBe(
      20,
    );
    await expect(canvas.getAllByRole('img')).toHaveLength(1);
    await expect(getComputedStyle(tile.querySelector('svg')!).color).toBe(
      getComputedStyle(tile).color,
    );
  },
};
