import { type CodeEditorProps } from '../src/components/code-editor/CodeEditor/types/CodeEditorProps';

export const CODE_EDITOR_PROP_DESCRIPTIONS = {
  value:
    'Content of the editor. Pair it with `onChange` to control the editor.',
  language:
    'Monaco language identifier for highlighting and language services, such as `json` or `typescript`.',
  height:
    'Editor height in pixels or as a CSS length. With `resizable`, a numeric height sets the initial height.',
  options:
    'Monaco editor options merged over the Twenty defaults. `padding` is ignored; use `contentPadding` instead.',
  onMount:
    'Called when the editor is ready, with the editor instance and the Monaco namespace. The Twenty theme is already applied.',
  onValidate:
    'Called with the markers Monaco reports after validating the content, such as JSON syntax errors.',
  onChange: 'Called with the full content whenever it changes.',
  setMarkers:
    'Returns custom validation markers for the content. Runs when the editor mounts and after every change, replacing the previous custom markers.',
  variant:
    'Border treatment: `default` draws a rounded border, `with-header` attaches the editor below a `CodeEditorHeader`, and `borderless` removes the border.',
  isLoading:
    'Shows a loader at the editor height instead of the editor. A loader also shows while Monaco loads.',
  transparentBackground:
    'Removes the editor background so the surrounding surface shows through.',
  resizable: 'Adds a handle below the editor to drag its height.',
  resizeLabel:
    'Accessible name of the resize handle. Pass a localized label when `resizable` is enabled.',
  contentPadding:
    '`default` pads the top and bottom of the content. `comfortable` also widens the gap between line numbers and code.',
  autoHeight:
    'Grows the editor to fit its content instead of using `height`. Ignored when `resizable` is set.',
} satisfies Partial<Record<keyof CodeEditorProps, string>>;
