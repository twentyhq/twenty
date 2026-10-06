import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { PanelResizeHandle } from '../PanelResizeHandle';

import { PanelResizeHandleDemo } from './PanelResizeHandleDemo';

const meta = {
  title: 'UI/Components/PanelResizeHandle',
  component: PanelResizeHandle,
  decorators: [ComponentDecorator],
  args: { edge: 'right', size: 220, minSize: 140, maxSize: 360 },
  render: (args) => <PanelResizeHandleDemo key={args.size} {...args} />,
} satisfies Meta<typeof PanelResizeHandle>;

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
