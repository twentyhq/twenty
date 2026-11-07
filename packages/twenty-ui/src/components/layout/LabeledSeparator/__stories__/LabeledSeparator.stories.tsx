import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

import { LabeledSeparator } from '../LabeledSeparator';

const meta: Meta<typeof LabeledSeparator> = {
  title: 'UI/Layout/LabeledSeparator',
  component: LabeledSeparator,
  decorators: [ComponentDecorator],
  args: { children: 'Or' },
};

export default meta;
type Story = StoryObj<typeof LabeledSeparator>;

export const Display: Story = {
  render: (args) => (
    <Text
      style={{
        display: 'grid',
        gap: 'var(--t-spacing-3)',
        width: 320,
        maxWidth: '100%',
      }}
    >
      <Button fullWidth>Import a CSV file</Button>
      <LabeledSeparator {...args} />
      <Button fullWidth variant="outline">
        Connect a data source
      </Button>
    </Text>
  ),
};

export const UnreadMarker: Story = {
  args: {
    children: 'New',
    labelPosition: 'end',
    tone: 'danger',
    hasStartMarker: true,
    style: { width: 488, maxWidth: '100%' },
  },
};

export const DarkTheme: Story = {
  globals: { colorScheme: 'dark' },
};

export const UnreadMarkerDarkTheme: Story = {
  args: UnreadMarker.args,
  globals: { colorScheme: 'dark' },
};

export const Semantics: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator', { name: 'Or' });

    await expect(canvas.getAllByRole('separator')).toHaveLength(1);
    await expect(separator).toHaveAttribute('aria-orientation', 'horizontal');
    await expect(getComputedStyle(separator).margin).toBe('0px');
  },
};

export const MarkedSeparator: Story = {
  args: UnreadMarker.args,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const separator = canvas.getByRole('separator', { name: 'New' });

    await expect(canvas.getAllByRole('separator')).toHaveLength(1);
    await expect(separator).toBeVisible();
  },
};

export const LongLabel: Story = {
  args: {
    children: 'Updates received since you last opened this conversation',
    style: { width: 180 },
  },
  play: async ({ canvasElement }) => {
    const separator = within(canvasElement).getByRole('separator', {
      name: 'Updates received since you last opened this conversation',
    });

    await expect(separator.scrollWidth).toBeLessThanOrEqual(
      separator.clientWidth,
    );
  },
};
