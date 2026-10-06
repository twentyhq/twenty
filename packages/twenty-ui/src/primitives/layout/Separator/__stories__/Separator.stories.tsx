import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { Separator } from '../Separator';

const meta: Meta<typeof Separator> = {
  title: 'UI/Layout/Separator',
  component: Separator,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  args: { 'aria-label': 'Sections' },
  play: async ({ canvasElement }) => {
    expect(
      within(canvasElement).getByRole('separator', { name: 'Sections' }),
    ).toHaveAttribute('aria-orientation', 'horizontal');
  },
};

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    'aria-label': 'Columns',
    style: { height: 80 },
  },
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole('separator', {
      name: 'Columns',
    });
    expect(separator).toHaveAttribute('aria-orientation', 'vertical');
    expect(separator.getBoundingClientRect().width).toBe(1);
    expect(separator.getBoundingClientRect().height).toBe(80);
  },
};

export const LabeledComposition: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getAllByRole('separator')).toHaveLength(1);
    expect(canvas.getByRole('separator', { name: 'New' })).toBeVisible();
  },
  render: () => (
    <Text
      role="separator"
      aria-label="New"
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        color: 'var(--t-tag-text-red)',
      }}
    >
      <Separator
        aria-hidden
        style={{ flexGrow: 1, width: 'auto', backgroundColor: 'currentColor' }}
      />
      <Text
        render={<span />}
        style={{
          marginInline: 'var(--t-spacing-2)',
          fontSize: 11,
          fontWeight: 'var(--t-font-weight-semi-bold)',
        }}
      >
        New
      </Text>
    </Text>
  ),
};

export const Documentation: Story = { args: Default.args };

export const VerticalDocumentation: Story = { args: Vertical.args };
