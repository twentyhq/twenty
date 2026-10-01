import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { ResizablePanel } from '../ResizablePanel';

import { ResizablePanelDemo } from './ResizablePanelDemo';

const meta = {
  title: 'UI/Components/ResizablePanel',
  component: ResizablePanel,
  decorators: [ComponentDecorator],
  args: { side: 'right', min: 140, max: 360 },
  render: (args) => <ResizablePanelDemo {...args} />,
} satisfies Meta<typeof ResizablePanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Documentation: Story = {};

export const LeftEdge: Story = {
  args: { side: 'left' },
};

export const TopEdge: Story = {
  args: { side: 'top' },
};

export const BottomEdge: Story = {
  args: { side: 'bottom' },
};

export const Gap: Story = {
  args: { side: 'top', variant: 'gap' },
};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
};
