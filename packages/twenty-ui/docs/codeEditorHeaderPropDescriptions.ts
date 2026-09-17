import { type CodeEditorHeaderProps } from '../src/components/code-editor/CodeEditorHeader/types/CodeEditorHeaderProps';

export const CODE_EDITOR_HEADER_PROP_DESCRIPTIONS = {
  title: 'Text shown at the start of the header, after `leftNodes`.',
  leftNodes: 'Elements shown at the start of the header, such as tabs.',
  rightNodes: 'Elements shown at the end of the header, such as actions.',
} satisfies Partial<Record<keyof CodeEditorHeaderProps, string>>;
