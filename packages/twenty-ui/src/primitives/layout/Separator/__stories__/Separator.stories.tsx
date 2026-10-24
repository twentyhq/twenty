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

export const Display: Story = {
  render: (args) => (
    <Text style={{ display: 'grid', gap: 'var(--t-spacing-3)' }}>
      <Text>Import records from a CSV file.</Text>
      <Separator {...args} />
      <Text>Connect an external data source.</Text>
    </Text>
  ),
};

export const Default: Story = {
  args: { 'aria-label': 'Sections' },
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole('separator', {
      name: 'Sections',
    });
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(getComputedStyle(separator).margin).toBe('0px');
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
    await expect(getComputedStyle(separator).margin).toBe('0px');
  },
};

export const VerticalDocumentation: Story = { args: Vertical.args };
