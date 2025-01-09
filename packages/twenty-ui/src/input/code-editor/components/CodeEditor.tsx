import { useTheme, css } from '@emotion/react';
import Editor, { EditorProps, Monaco } from '@monaco-editor/react';
import { codeEditorTheme } from '@ui/input';
import { isDefined } from '@ui/utilities';
import styled from '@emotion/styled';
import { useState } from 'react';
import { editor } from 'monaco-editor';

type CodeEditorProps = Omit<EditorProps, 'onChange'> & {
  onChange?: (value: string) => void;
  setMarkers?: (value: string) => editor.IMarkerData[];
  withHeader?: boolean;
};

const StyledEditor = styled(Editor)<{ withHeader: boolean }>`
  .monaco-editor {
    border-radius: ${({ theme }) => theme.border.radius.sm};
    outline-width: 0;
  }
  .overflow-guard {
    border: 1px solid ${({ theme }) => theme.border.color.medium};
    box-sizing: border-box;
    ${({ withHeader, theme }) =>
      withHeader
        ? css`
            border-radius: 0 0 ${theme.border.radius.sm}
              ${theme.border.radius.sm};
            border-top: none;
          `
        : css`
            border-radius: ${theme.border.radius.sm};
          `}
  }
`;

export const CodeEditor = ({
  value,
  language,
  onMount,
  onChange,
  setMarkers,
  onValidate,
  height = 450,
  withHeader = false,
  options,
}: CodeEditorProps) => {
  const theme = useTheme();
  const [monaco, setMonaco] = useState<Monaco | undefined>(undefined);
  const [editor, setEditor] = useState<
    editor.IStandaloneCodeEditor | undefined
  >(undefined);

  const setModelMarkers = (
    editor: editor.IStandaloneCodeEditor | undefined,
    monaco: Monaco | undefined,
  ) => {
    const model = editor?.getModel();
    if (!isDefined(model)) {
      return;
    }
    const customMarkers = setMarkers?.(model.getValue());
    if (isDefined(customMarkers)) {
      monaco?.editor.setModelMarkers(model, 'customMarker', customMarkers);
    }
  };

  return (
    <StyledEditor
      height={height}
      withHeader={withHeader}
      value={value}
      language={language}
      onMount={(editor, monaco) => {
        setMonaco(monaco);
        setEditor(editor);
        monaco.editor.defineTheme('codeEditorTheme', codeEditorTheme(theme));
        monaco.editor.setTheme('codeEditorTheme');
        onMount?.(editor, monaco);
        setModelMarkers(editor, monaco);
      }}
      onChange={(value) => {
        if (isDefined(value)) {
          onChange?.(value);
          setModelMarkers(editor, monaco);
        }
      }}
      onValidate={(markers) => {
        onValidate?.(markers);
      }}
      options={{
        overviewRulerLanes: 0,
        scrollbar: {
          vertical: 'hidden',
          horizontal: 'hidden',
        },
        minimap: {
          enabled: false,
        },
        ...options,
      }}
    />
  );
};
