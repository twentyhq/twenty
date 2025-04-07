import { css, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import Editor, { EditorProps, Monaco } from '@monaco-editor/react';
import { Loader } from '@ui/feedback/loader/components/Loader';
import { codeEditorTheme } from '@ui/input';
import { editor } from 'monaco-editor';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CodeEditorVariant = 'default' | 'with-header' | 'borderless';

type CodeEditorProps = Pick<
  EditorProps,
  'value' | 'language' | 'onMount' | 'onValidate' | 'height' | 'options'
> & {
  onChange?: (value: string) => void;
  setMarkers?: (value: string) => editor.IMarkerData[];
  variant?: CodeEditorVariant;
  isLoading?: boolean;
  transparentBackground?: boolean;
};

const StyledEditorLoader = styled.div<{
  height: string | number;
  variant: CodeEditorVariant;
}>`
  align-items: center;
  display: flex;
  height: ${({ height }) => height}px;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  ${({ variant, theme }) => {
    switch (variant) {
      case 'default':
        return css`
          border-radius: ${theme.border.radius.sm};
        `;
      case 'borderless':
        return css`
          border: none;
        `;
      case 'with-header':
        return css`
          border-radius: 0 0 ${theme.border.radius.sm} ${theme.border.radius.sm};
          border-top: none;
        `;
    }
  }}
`;

const StyledEditor = styled(Editor)<{
  variant: CodeEditorVariant;
}>`
  .monaco-editor {
    outline-width: 0;

    ${({ variant, theme }) =>
      variant !== 'borderless'
        ? css`
            border-radius: ${theme.border.radius.sm};
          `
        : undefined}
  }

  .overflow-guard {
    box-sizing: border-box;

    ${({ variant, theme }) => {
      switch (variant) {
        case 'default': {
          return css`
            border: 1px solid ${theme.border.color.medium};
            border-radius: ${theme.border.radius.sm};
          `;
        }
        case 'with-header': {
          return css`
            border: 1px solid ${theme.border.color.medium};
            border-radius: 0 0 ${theme.border.radius.sm}
              ${theme.border.radius.sm};
            border-top: none;
          `;
        }
      }
    }}
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
  variant = 'default',
  transparentBackground,
  isLoading = false,
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

  return isLoading ? (
    <StyledEditorLoader height={height} variant={variant}>
      <Loader />
    </StyledEditorLoader>
  ) : (
    <StyledEditor
      height={height}
      variant={variant}
      value={isLoading ? '' : value}
      language={language}
      loading=""
      onMount={(editor, monaco) => {
        setMonaco(monaco);
        setEditor(editor);
        monaco.editor.defineTheme(
          'codeEditorTheme',
          codeEditorTheme({
            theme,
            transparentBackground,
          }),
        );
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
          ...options?.scrollbar,
        },
        minimap: {
          enabled: false,
          ...options?.minimap,
        },
        ...options,
      }}
    />
  );
};
