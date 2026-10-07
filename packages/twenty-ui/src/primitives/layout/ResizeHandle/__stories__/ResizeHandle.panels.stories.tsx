import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { ResizeHandle } from '../ResizeHandle';

import { ResizeHandlePanelDemo } from './ResizeHandlePanelDemo';

const meta = {
  id: 'ui-layout-resizehandle-panels',
  title: 'UI/Layout/ResizeHandle/Panels',
  component: ResizeHandle,
  decorators: [ComponentDecorator],
  args: { edge: 'right', value: 220, min: 140, max: 360 },
  render: (args) => <ResizeHandlePanelDemo key={args.value} {...args} />,
} satisfies Meta<typeof ResizeHandle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Documentation: Story = {};

export const LeftEdge: Story = {
  args: { edge: 'left' },
};

export const TopEdge: Story = {
  args: { edge: 'top' },
};

export const BottomEdge: Story = {
  args: { edge: 'bottom' },
};

export const Gap: Story = {
  args: { edge: 'top', placement: 'gap' },
};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
};
