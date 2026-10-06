import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { IconButton } from '@ui/components/input/IconButton/IconButton';
import { IconCopy } from '@ui/icon/components/TablerIcons';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CodeEditorHeader } from '../CodeEditorHeader';

const meta: Meta<typeof CodeEditorHeader> = {
  id: 'ui-components-codeeditorheader',
  title: 'UI/Components/Code editor/CodeEditorHeader',
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

const handleRun = fn();

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
    title: <Text>workspace.json</Text>,
    startElement: (
      <IconButton size="sm" variant="ghost" aria-label="Copy code">
        <IconCopy />
      </IconButton>
    ),
    endElement: (
      <>
        <Button size="sm" variant="outline">
          Format
        </Button>
        <Button size="sm" variant="solid" color="accent" onClick={handleRun}>
          Run
        </Button>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    handleRun.mockClear();

    await expect(canvas.getByText('workspace.json')).toBeVisible();
    await expect(
      canvas.getByRole('button', { name: 'Copy code' }),
    ).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Run' })).toBeVisible();
    await expect(canvas.getByRole('button', { name: 'Format' })).toBeVisible();

    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Copy code' }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Format' })).toHaveFocus();
    await userEvent.tab();
    await expect(canvas.getByRole('button', { name: 'Run' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(handleRun).toHaveBeenCalledTimes(1);
  },
};
