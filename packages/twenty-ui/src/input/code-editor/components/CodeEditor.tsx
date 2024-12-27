import { useTheme, css } from '@emotion/react';
import Editor, { EditorProps } from '@monaco-editor/react';
import { codeEditorTheme } from '@ui/input';
import { isDefined } from '@ui/utilities';
import styled from '@emotion/styled';

type CodeEditorProps = Omit<EditorProps, 'onChange'> & {
  onChange?: (value: string) => void;
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
  onValidate,
  height = 450,
  withHeader = false,
  options,
}: CodeEditorProps) => {
  const theme = useTheme();

  return (
    <StyledEditor
      height={height}
      withHeader={withHeader}
      value={value}
      language={language}
      onMount={(editor, monaco) => {
        monaco.editor.defineTheme('codeEditorTheme', codeEditorTheme(theme));
        monaco.editor.setTheme('codeEditorTheme');

        onMount?.(editor, monaco);
      }}
      onChange={(value) => {
        if (isDefined(value)) {
          onChange?.(value);
        }
      }}
      onValidate={onValidate}
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
