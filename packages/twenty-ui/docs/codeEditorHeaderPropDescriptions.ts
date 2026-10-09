import { type CodeEditorHeaderProps } from '../src/components/code-editor/CodeEditorHeader/types/CodeEditorHeaderProps';

export const CODE_EDITOR_HEADER_PROP_DESCRIPTIONS = {
  title:
    'Content shown after `startElement`. This is visible header content, not the native HTML title attribute.',
  startElement:
    'Content shown at the start of the header, before the title, such as tabs. Use a fragment for multiple elements.',
  endElement:
    'Content shown at the end of the header, such as actions. Use a fragment for multiple elements.',
  ref: 'Ref forwarded to the rendered root element, a div by default.',
  className: 'Additional CSS class applied to the root element.',
  style: 'Inline styles applied to the root element.',
  render:
    'Replace the root div or compose it with another component. Native props and refs target the rendered root.',
} satisfies Partial<Record<keyof CodeEditorHeaderProps, string>>;
