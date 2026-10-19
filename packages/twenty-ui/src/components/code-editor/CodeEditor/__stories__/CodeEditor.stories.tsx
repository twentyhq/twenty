import {
  type BeforeMount,
  type OnChange,
  type OnMount,
  type OnValidate,
} from '@monaco-editor/react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { CodeEditorHeader } from '@ui/components/code-editor/CodeEditorHeader/CodeEditorHeader';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { CodeEditor } from '../CodeEditor';
import { ControlledCodeEditor } from './ControlledCodeEditor';
import { ModelCodeEditor } from './ModelCodeEditor';
import { ResizableCodeEditor } from './ResizableCodeEditor';
import { ThemedCodeEditor } from './ThemedCodeEditor';
import { UnmountingCodeEditor } from './UnmountingCodeEditor';
import { waitForCodeEditorContent } from './waitForCodeEditorContent';

const WORKSPACE_SETTINGS_JSON = JSON.stringify(
  { name: 'Acme', plan: 'Pro', seats: 12 },
  null,
  2,
);
const INITIAL_EDITOR_VALUE = 'Initial editor content';
const CALLER_THEME_ID = 'code-editor-caller-theme';
let mountedEditor: Parameters<OnMount> | undefined;
let latestChange: Parameters<OnChange> | undefined;
let latestValidatedMarkers: Parameters<OnValidate>[0] | undefined;
let containerElement: HTMLDivElement | null | undefined;
let lifecycleOrder: ('beforeMount' | 'onMount')[] = [];
const handleChange = fn((...change: Parameters<OnChange>) => {
  latestChange = change;
});
const handleMount = fn((...editor: Parameters<OnMount>) => {
  mountedEditor = editor;
  lifecycleOrder.push('onMount');
});
const handleValidate = fn((markers: Parameters<OnValidate>[0]) => {
  latestValidatedMarkers = markers;
});
const handleContainerRef = fn((element: HTMLDivElement | null) => {
  containerElement = element;
});
const handleBeforeMount = fn<BeforeMount>((monaco) => {
  lifecycleOrder.push('beforeMount');
  monaco.editor.defineTheme(CALLER_THEME_ID, {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#123456',
      'editor.foreground': '#ffffff',
    },
  });
});

const getMountedEditor = () => {
  if (!isDefined(mountedEditor)) {
    throw new Error('Code editor has not mounted');
  }

  const [editor, monaco] = mountedEditor;

  return { editor, monaco };
};

const getLatestChange = () => {
  if (!isDefined(latestChange)) {
    throw new Error('Code editor has not emitted a change');
  }

  return latestChange;
};

const getLatestValidatedMarkers = () => {
  if (!isDefined(latestValidatedMarkers)) {
    throw new Error('Code editor has not emitted validation markers');
  }

  return latestValidatedMarkers;
};

const meta: Meta<typeof CodeEditor> = {
  id: 'ui-components-codeeditor',
  title: 'UI/Components/Code editor/CodeEditor',
  component: CodeEditor,
  args: {
    value: WORKSPACE_SETTINGS_JSON,
    language: 'json',
    height: 160,
    beforeMount: handleBeforeMount,
    onMount: handleMount,
  },
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 480 },
  },
  beforeEach: () => {
    handleChange.mockClear();
    handleMount.mockClear();
    handleValidate.mockClear();
    handleContainerRef.mockClear();
    handleBeforeMount.mockClear();
    mountedEditor = undefined;
    latestChange = undefined;
    latestValidatedMarkers = undefined;
    containerElement = undefined;
    lifecycleOrder = [];
  },
  render: (args) => (
    <div style={{ width: '100%' }}>
      <CodeEditor {...args} />
    </div>
  ),
};

export default meta;

type Story = StoryObj<typeof CodeEditor>;

export const Display: Story = {
  decorators: [ComponentDecorator],
  args: {
    variant: 'with-header',
    value: undefined,
    defaultValue: WORKSPACE_SETTINGS_JSON,
    beforeMount: undefined,
    onMount: undefined,
  },
  render: (args) => (
    <div style={{ width: '100%' }}>
      <CodeEditorHeader title="workspace.json" />
      <CodeEditor {...args} />
    </div>
  ),
};

export const Default: Story = {
  decorators: [ComponentDecorator],
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '"name": "Acme"',
    });
  },
};

export const Resizable: Story = {
  ...Default,
  args: {
    resizable: true,
    autoHeight: true,
    resizeLabel: 'Resize code sample',
  },
  render: (args) => <ResizableCodeEditor {...args} />,
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '"name": "Acme"',
    });
    const canvas = within(canvasElement);
    const handle = canvas.getByRole('separator', {
      name: 'Resize code sample',
    });

    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '170');
    await waitFor(() => {
      expect(
        canvasElement.querySelector('.monaco-editor')?.getBoundingClientRect()
          .height,
      ).toBe(170);
    });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Set height to 240' }),
    );
    await expect(handle).toHaveAttribute('aria-valuenow', '240');
    await waitFor(() => {
      expect(
        canvasElement.querySelector('.monaco-editor')?.getBoundingClientRect()
          .height,
      ).toBe(240);
    });
  },
};

export const CssHeightResizable: Story = {
  ...Resizable,
  args: {
    ...Resizable.args,
    height: '100%',
  },
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '"name": "Acme"',
    });
    const handle = within(canvasElement).getByRole('separator', {
      name: 'Resize code sample',
    });

    await waitFor(() => {
      expect(handle).toHaveAttribute('aria-valuenow', '220');
    });
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '230');
    await waitFor(() => {
      expect(
        canvasElement.querySelector('.monaco-editor')?.getBoundingClientRect()
          .height,
      ).toBe(230);
    });
  },
};

export const BoundedResizable: Story = {
  ...Resizable,
  args: {
    ...Resizable.args,
    height: 800,
  },
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '\"name\": \"Acme\"',
    });
    const handle = within(canvasElement).getByRole('separator', {
      name: 'Resize code sample',
    });

    await waitFor(() => {
      expect(handle).toHaveAttribute('aria-valuenow', '500');
      expect(
        canvasElement.querySelector('.monaco-editor')?.getBoundingClientRect()
          .height,
      ).toBe(500);
    });
    handle.focus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(handle).toHaveAttribute('aria-valuenow', '500');
    await userEvent.keyboard('{ArrowUp}');
    await expect(handle).toHaveAttribute('aria-valuenow', '490');
    await waitFor(() => {
      expect(
        canvasElement.querySelector('.monaco-editor')?.getBoundingClientRect()
          .height,
      ).toBe(490);
    });
  },
};

export const Dark: Story = {
  ...Display,
  play: Default.play,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const Editing: Story = {
  ...Default,
  args: {
    value: undefined,
    language: undefined,
    defaultValue: INITIAL_EDITOR_VALUE,
    defaultLanguage: 'plaintext',
    defaultPath: 'file:///code-editor-editing.txt',
    onChange: handleChange,
    onValidate: handleValidate,
    setMarkers: () => [
      {
        severity: 4,
        message: 'Review workspace configuration',
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 2,
      },
    ],
    options: { occurrencesHighlight: 'off', cursorBlinking: 'solid' },
  },
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: INITIAL_EDITOR_VALUE,
    });
    await expect(handleMount).toHaveBeenCalledTimes(1);
    await expect(handleBeforeMount).toHaveBeenCalledTimes(1);
    await expect(lifecycleOrder).toEqual(['beforeMount', 'onMount']);
    const { editor, monaco } = getMountedEditor();
    const model = editor.getModel();

    await expect(handleBeforeMount).toHaveBeenCalledWith(monaco);
    await expect(model?.getValue()).toBe(INITIAL_EDITOR_VALUE);
    await expect(model?.getLanguageId()).toBe('plaintext');
    await expect(model?.uri.toString()).toBe('file:///code-editor-editing.txt');

    within(canvasElement).getByRole('textbox').focus();
    await userEvent.keyboard('x');

    await waitFor(() => {
      expect(handleChange).toHaveBeenCalled();
      const [value, event] = getLatestChange();
      const [change] = event.changes;

      if (!isDefined(change)) {
        throw new Error('Code editor change has no content details');
      }

      expect(value).toBe(`x${INITIAL_EDITOR_VALUE}`);
      expect(event.changes).toHaveLength(1);
      expect(change.text).toBe('x');
      expect(change.rangeOffset).toBe(0);
      expect(change.rangeLength).toBe(0);
      expect(change.range.startLineNumber).toBe(1);
      expect(change.range.startColumn).toBe(1);
      expect(event.isFlush).toBe(false);
      expect(event.isUndoing).toBe(false);
      expect(event.isRedoing).toBe(false);
      expect(event.versionId).toBeGreaterThan(1);
      expect(handleValidate).toHaveBeenCalled();
      const markers = getLatestValidatedMarkers();
      const [marker] = markers;

      if (!isDefined(marker)) {
        throw new Error('Code editor validation has no marker');
      }

      expect(markers).toHaveLength(1);
      expect(marker.owner).toBe('customMarker');
      expect(marker.resource).toBe(model?.uri);
      expect(marker.severity).toBe(monaco.MarkerSeverity.Warning);
      expect(marker.message).toBe('Review workspace configuration');
      expect(marker.startLineNumber).toBe(1);
      expect(marker.endColumn).toBe(2);
    });
  },
};

export const ModelLifecycle: Story = {
  ...Default,
  args: {
    value: undefined,
    language: undefined,
    saveViewState: true,
    options: { occurrencesHighlight: 'off' },
  },
  render: (args) => <ModelCodeEditor {...args} />,
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: 'Workspace notes',
    });
    const canvas = within(canvasElement);
    const { editor } = getMountedEditor();
    const notesModel = editor.getModel();

    editor.setPosition({ lineNumber: 3, column: 1 });
    canvas.getByRole('textbox').focus();
    await userEvent.keyboard('x');
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: 'xPlan: Pro',
    });
    const notesPosition = editor.getPosition();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Open query.ts' }),
    );
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: 'export const seats = 12;',
    });
    const queryModel = editor.getModel();

    try {
      await expect(queryModel?.getLanguageId()).toBe('typescript');
      await expect(queryModel?.uri.toString()).toBe(
        'file:///code-editor-model-query.ts',
      );
      await expect(queryModel).not.toBe(notesModel);

      await userEvent.click(
        canvas.getByRole('button', { name: 'Open notes.txt' }),
      );
      await waitForCodeEditorContent({
        canvasElement,
        expectedContent: 'xPlan: Pro',
      });
      await expect(editor.getModel()).toBe(notesModel);
      await expect(editor.getModel()?.getLanguageId()).toBe('plaintext');
      await expect(editor.getPosition()).toEqual(notesPosition);
      await expect(handleMount).toHaveBeenCalledTimes(1);
    } finally {
      editor.setModel(notesModel);
      queryModel?.dispose();
    }
  },
};

export const ControlledValue: Story = {
  ...Default,
  args: {
    onChange: handleChange,
    options: {
      occurrencesHighlight: 'off',
      padding: { top: 3, bottom: 19 },
    },
    setMarkers: (value) => [
      {
        severity: 4,
        message: `Review ${value}`,
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 2,
      },
    ],
  },
  render: (args) => <ControlledCodeEditor {...args} />,
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: 'Initial controlled value',
    });
    const canvas = within(canvasElement);
    const { editor, monaco } = getMountedEditor();
    const model = editor.getModel();

    canvas.getByRole('textbox').focus();
    await userEvent.keyboard('x');
    const [value, event] = getLatestChange();

    await expect(value).toBe('xInitial controlled value');
    await expect(event.isFlush).toBe(false);
    handleChange.mockClear();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Append controlled value' }),
    );
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: 'xInitial controlled value (updated)',
    });
    await expect(editor.getModel()).toBe(model);
    await expect(handleChange).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace controlled value' }),
    );
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: 'export const seats = 24;',
    });
    await expect(editor.getModel()).toBe(model);
    await expect(model?.getLanguageId()).toBe('typescript');
    await waitFor(() => {
      expect(editor.getOption(monaco.editor.EditorOption.padding)).toEqual({
        top: 7,
        bottom: 21,
      });
      expect(
        monaco.editor.getModelMarkers({
          owner: 'customMarker',
          resource: model?.uri,
        }),
      ).toEqual([
        expect.objectContaining({ message: 'Review export const seats = 24;' }),
      ]);
    });
    await expect(handleChange).not.toHaveBeenCalled();
  },
};

export const CallerOptionsAndNativeTargets: Story = {
  ...Default,
  args: {
    height: 180,
    width: 320,
    contentPadding: 'comfortable',
    className: 'code-editor-monaco-container',
    containerProps: {
      id: 'code-editor-outer',
      title: 'Outer editor container',
    },
    wrapperProps: { id: 'code-editor-section', title: 'Monaco wrapper' },
    ref: handleContainerRef,
    options: {
      padding: { top: 3, bottom: 19 },
      fontSize: 16,
      lineNumbers: 'off',
      lineDecorationsWidth: 4,
      minimap: { enabled: true },
    },
  },
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '"name": "Acme"',
    });
    const canvas = within(canvasElement);
    const outerContainer = canvas.getByTitle('Outer editor container');
    const monacoWrapper = canvas.getByTitle('Monaco wrapper');
    const { editor, monaco } = getMountedEditor();

    await expect(outerContainer.tagName).toBe('DIV');
    await expect(containerElement).toBe(outerContainer);
    await expect(monacoWrapper.tagName).toBe('SECTION');
    await expect(outerContainer).toContainElement(monacoWrapper);
    await expect(
      monacoWrapper.querySelector('.code-editor-monaco-container'),
    ).toContainElement(editor.getDomNode());
    await expect(editor.getOption(monaco.editor.EditorOption.padding)).toEqual({
      top: 3,
      bottom: 19,
    });
    await expect(editor.getOption(monaco.editor.EditorOption.fontSize)).toBe(
      16,
    );
    await expect(
      editor.getOption(monaco.editor.EditorOption.minimap).enabled,
    ).toBe(true);
    await expect(
      editor.getOption(monaco.editor.EditorOption.lineDecorationsWidth),
    ).toBe(4);
    await expect(monacoWrapper.getBoundingClientRect().width).toBe(320);
    await expect(monacoWrapper.getBoundingClientRect().height).toBe(180);
  },
};

export const ThemePrecedence: Story = {
  ...Default,
  args: { theme: CALLER_THEME_ID, options: { theme: 'vs-dark' } },
  render: (args) => <ThemedCodeEditor {...args} />,
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '"name": "Acme"',
    });
    const canvas = within(canvasElement);

    await expect(
      canvasElement.querySelector('.monaco-editor-background'),
    ).toHaveStyle({ backgroundColor: 'rgb(18, 52, 86)' });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use option theme' }),
    );
    await waitFor(() => {
      expect(
        canvasElement.querySelector('.monaco-editor-background'),
      ).toHaveStyle({
        backgroundColor: 'rgb(30, 30, 30)',
      });
    });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use Twenty theme' }),
    );
    await waitFor(() => {
      expect(
        canvasElement.querySelector('.monaco-editor-background'),
      ).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0)',
      });
    });
  },
};

export const AutoHeight: Story = {
  ...Default,
  args: {
    value: undefined,
    language: 'plaintext',
    defaultValue: 'Workspace notes\nPlan: Pro',
    height: 300,
    autoHeight: true,
    options: { occurrencesHighlight: 'off' },
  },
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: 'Workspace notes',
    });
    const { editor } = getMountedEditor();

    await waitFor(() => {
      expect(editor.getDomNode()?.getBoundingClientRect().height).toBe(
        editor.getContentHeight(),
      );
      expect(editor.getContentHeight()).toBeLessThan(300);
    });
    const initialHeight = editor.getContentHeight();
    within(canvasElement).getByRole('textbox').focus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => {
      expect(editor.getContentHeight()).toBeGreaterThan(initialHeight);
      expect(editor.getDomNode()?.getBoundingClientRect().height).toBe(
        editor.getContentHeight(),
      );
    });
  },
};

export const ModelDisposal: Story = {
  ...Default,
  args: {
    path: 'file:///code-editor-disposal.json',
    autoHeight: true,
    ref: handleContainerRef,
  },
  render: (args) => <UnmountingCodeEditor {...args} />,
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '"name": "Acme"',
    });
    const canvas = within(canvasElement);
    const { editor } = getMountedEditor();
    const model = editor.getModel();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Unmount editor' }),
    );
    await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
    await expect(model?.isDisposed()).toBe(true);
    await expect(containerElement).toBeNull();
  },
};

export const RetainedModel: Story = {
  ...ModelDisposal,
  args: {
    path: 'file:///code-editor-retained.json',
    autoHeight: true,
    keepCurrentModel: true,
    onChange: handleChange,
  },
  play: async ({ canvasElement }) => {
    await waitForCodeEditorContent({
      canvasElement,
      expectedContent: '"name": "Acme"',
    });
    const canvas = within(canvasElement);
    const { editor, monaco } = getMountedEditor();
    const model = editor.getModel();

    try {
      await userEvent.click(
        canvas.getByRole('button', { name: 'Unmount editor' }),
      );
      await expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
      await expect(model?.isDisposed()).toBe(false);
      await expect(
        monaco.editor.getModel(
          monaco.Uri.parse('file:///code-editor-retained.json'),
        ),
      ).toBe(model);
      handleChange.mockClear();
      model?.setValue('Retained after unmount');
      await expect(handleChange).not.toHaveBeenCalled();
    } finally {
      model?.dispose();
    }
  },
};

export const Loading: Story = {
  decorators: [ComponentDecorator],
  args: { isLoading: true },
};
