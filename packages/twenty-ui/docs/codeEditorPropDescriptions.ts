import { type CodeEditorProps } from '../src/components/code-editor/CodeEditor/types/CodeEditorProps';

export const CODE_EDITOR_PROP_DESCRIPTIONS = {
  defaultValue: 'Initial content for a model created by Monaco React.',
  defaultLanguage: 'Initial Monaco language for a newly created model.',
  defaultPath: 'Initial model URI, used when `path` is omitted.',
  value:
    'Content of the editor. Pair it with `onChange` to control the editor.',
  language:
    'Monaco language identifier for highlighting and language services, such as `json` or `typescript`.',
  height:
    'Editor height in pixels or as a CSS length, defaulting to 450px. Resizing starts from this rendered height and resets when this prop changes. Auto-height uses it until content is measured.',
  width: 'Width of the Monaco React section, in pixels or as a CSS length.',
  path: 'URI of the current model. Changing it selects or creates a model using Monaco React behavior.',
  theme:
    'Monaco theme name. Takes precedence over `options.theme`, which takes precedence over the Twenty theme. Define custom themes in `beforeMount`.',
  loading:
    'Content shown while Monaco loads or `isLoading` is true. Defaults to the Twenty Loader.',
  line: 'Line revealed when the editor mounts or this prop changes.',
  options:
    'Monaco editor options merged over Twenty defaults. Explicit values, including padding, replace the corresponding defaults. The `theme` prop takes precedence over `options.theme`.',
  overrideServices:
    'Monaco services passed through when the editor is created.',
  saveViewState:
    'Preserves Monaco React view state between model changes. Defaults to true.',
  keepCurrentModel:
    'Keeps the current model when the editor unmounts. Defaults to false. The caller owns disposal of retained models.',
  className: 'Class applied to the Monaco editor-container div.',
  wrapperProps:
    'Native props passed unchanged to the Monaco React section around the editor and Monaco React loading content. Use this section for layout styles and a measurable native ref. Not applied to the separate Twenty loader during initial Monaco configuration or `isLoading`. Native styles can override the section sizing.',
  containerProps:
    "Native props, className and style for the outer Twenty group div. Its default `display: contents` preserves the Monaco section's parent sizing and flex layout without creating a layout box. Background, border, padding and dimensions require overriding `display`. Prefer `wrapperProps` for section layout styles. Its keyboard handler runs before focused editor keystrokes stop propagating.",
  ref: 'Ref to the outer Twenty group div, which has no measurable layout box with its default `display: contents`. Use `wrapperProps` for a measurable section ref or `onMount` for the Monaco editor instance.',
  beforeMount:
    'Called with Monaco before editor creation, after the Twenty theme has been defined. Use it to register custom themes or languages.',
  onMount:
    'Called when the editor is ready, with the editor instance and the Monaco namespace. The selected theme is already applied.',
  onValidate:
    'Called with the markers Monaco reports after validating the content, such as JSON syntax errors.',
  onChange:
    'Monaco React callback with the full content (string or undefined) and the original IModelContentChangedEvent.',
  setMarkers:
    'Returns custom validation markers for the current model content. Runs on mount, model selection and content changes, including controlled updates.',
  variant:
    'Border treatment: `default` draws a rounded border, `with-header` attaches the editor below a `CodeEditorHeader`, and `borderless` removes the border.',
  isLoading:
    'Shows a loader at the editor height instead of the editor. A loader also shows while Monaco loads.',
  transparentBackground:
    'Removes the editor background so the surrounding surface shows through.',
  resizable:
    'Adds a height resize handle after Monaco mounts, bounded from 50px to 500px. Takes precedence over autoHeight. A changed height prop resets the resized height within these bounds.',
  resizeLabel:
    'Accessible name of the resize handle. Pass a localized label when `resizable` is enabled.',
  contentPadding:
    '`default` supplies top and bottom padding. `comfortable` also widens the gap between line numbers and code. Explicit Monaco options override these defaults.',
  autoHeight:
    'Grows the editor to fit its content instead of using `height`. Ignored when `resizable` is set.',
} satisfies Partial<Record<keyof CodeEditorProps, string>>;
