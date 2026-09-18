import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CodeEditorHeader } from '@ui/components/code-editor/CodeEditorHeader/CodeEditorHeader';
import { Button } from '@ui/primitives/input/Button/Button';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { CodeEditor } from '../CodeEditor';
import { waitForCodeEditorContent } from './waitForCodeEditorContent';

const WORKSPACE_SETTINGS_JSON = JSON.stringify(
  { name: 'Acme', plan: 'Pro', seats: 12 },
  null,
  2,
);

const handleChange = fn();

const meta: Meta<typeof CodeEditor> = {
  title: 'UI/Components/CodeEditor',
  component: CodeEditor,
  args: {
    value: WORKSPACE_SETTINGS_JSON,
    language: 'json',
    height: 160,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 480 },
  },
  render: (args) => (
    <div style={{ width: '100%' }}>
      <CodeEditor {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof CodeEditor>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent(canvasElement, '"name": "Acme"');
  },
};

export const Documentation: Story = {
  ...Default,
  args: { variant: 'with-header' },
  render: (args) => (
    <div style={{ width: '100%' }}>
      <CodeEditorHeader
        title="workspace.json"
        rightNodes={[
          <Button key="format" size="sm" variant="outline">
            Format
          </Button>,
        ]}
      />
      <CodeEditor {...args} />
    </div>
  ),
};

export const Dark: Story = {
  ...Documentation,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const Editing: Story = {
  ...Default,
  args: {
    language: 'plaintext',
    onChange: handleChange,
    options: { occurrencesHighlight: 'off', cursorBlinking: 'solid' },
  },
  play: async ({ canvasElement }) => {
    handleChange.mockClear();

    await waitForCodeEditorContent(canvasElement, '"name": "Acme"');

    within(canvasElement).getByRole('textbox').focus();
    await userEvent.keyboard('x');

    await waitFor(() => {
      expect(handleChange).toHaveBeenLastCalledWith(
        `x${WORKSPACE_SETTINGS_JSON}`,
      );
    });
  },
};

export const Loading: Story = {
  decorators: [ComponentDecorator],
  args: { isLoading: true },
};
