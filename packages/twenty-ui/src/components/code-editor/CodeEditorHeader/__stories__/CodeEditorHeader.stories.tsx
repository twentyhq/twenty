import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconCopy } from '@ui/icon/components/TablerIcons';
import { Button } from '@ui/primitives/input/Button/Button';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CodeEditorHeader } from '../CodeEditorHeader';

const meta: Meta<typeof CodeEditorHeader> = {
  title: 'UI/Components/CodeEditorHeader',
  component: CodeEditorHeader,
  args: { title: 'workspace.json' },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 480 },
  },
  render: (args) => (
    <div style={{ width: '100%' }}>
      <CodeEditorHeader {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof CodeEditorHeader>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByText('workspace.json'),
    ).toBeVisible();
  },
};

export const WithActions: Story = {
  ...Default,
  args: {
    leftNodes: [
      <LightIconButton key="copy" aria-label="Copy code">
        <IconCopy />
      </LightIconButton>,
    ],
    rightNodes: [
      <Button key="run" size="sm" variant="solid" color="accent">
        Run
      </Button>,
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('workspace.json')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Copy code' }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Run' })).toBeVisible();
  },
};
