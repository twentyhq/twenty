import { type EditorProps } from '@monaco-editor/react';
import { type editor } from 'monaco-editor';
import { type ComponentPropsWithoutRef, type Ref } from 'react';

type CodeEditorVariant = 'default' | 'with-header' | 'borderless';
type CodeEditorContentPadding = 'default' | 'comfortable';

export type CodeEditorProps = EditorProps & {
  containerProps?: Omit<ComponentPropsWithoutRef<'div'>, 'children'>;
  ref?: Ref<HTMLDivElement>;
  setMarkers?: (value: string) => editor.IMarkerData[];
  variant?: CodeEditorVariant;
  isLoading?: boolean;
  transparentBackground?: boolean;
  resizable?: boolean;
  resizeLabel?: string;
  contentPadding?: CodeEditorContentPadding;
  autoHeight?: boolean;
};
