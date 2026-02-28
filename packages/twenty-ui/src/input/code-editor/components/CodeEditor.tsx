import { styled } from '@linaria/react';
import Editor, { type EditorProps, type Monaco } from '@monaco-editor/react';
import { Loader } from '@ui/feedback/loader/components/Loader';
import { BASE_CODE_EDITOR_THEME_ID } from '@ui/input/code-editor/constants/BaseCodeEditorThemeId';
import { getBaseCodeEditorTheme } from '@ui/input/code-editor/theme/utils/getBaseCodeEditorTheme';
import { ThemeContext, type ThemeType } from '@ui/theme';
import { type editor } from 'monaco-editor';
import { type KeyboardEvent, useContext, useState } from 'react';
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
  theme: ThemeType;
}>`
  align-items: center;
  display: flex;
  height: ${({ height }) =>
    typeof height === 'number' ? `${height}px` : height};
  justify-content: center;
  border: ${({ variant, theme }) =>
    variant === 'borderless'
      ? 'none'
      : `1px solid ${theme.border.color.medium}`};
  border-top: ${({ variant, theme }) => {
    if (variant === 'default') return `1px solid ${theme.border.color.medium}`;
    return 'none';
  }};
  border-radius: ${({ variant, theme }) => {
    switch (variant) {
      case 'default':
        return theme.border.radius.sm;
      case 'with-header':
        return `0 0 ${theme.border.radius.sm} ${theme.border.radius.sm}`;
      default:
        return '0';
    }
  }};
  background-color: ${({ theme }) => theme.background.transparent.lighter};
`;

const StyledCodeEditorContainer = styled.div`
  display: contents;
`;

const StyledEditorWrapper = styled.div<{
  variant: CodeEditorVariant;
  transparentBackground?: boolean;
  theme: ThemeType;
}>`
  display: contents;

  .monaco-editor {
    outline-width: 0;

    background-color: ${({ theme, transparentBackground }) =>
      !transparentBackground ? theme.background.secondary : 'transparent'};

    border-radius: ${({ variant, theme }) =>
      variant !== 'borderless' ? theme.border.radius.sm : '0'};
  }

  .overflow-guard {
    box-sizing: border-box;

    border: ${({ variant, theme }) => {
      switch (variant) {
        case 'default':
        case 'with-header':
          return `1px solid ${theme.border.color.medium}`;
        default:
          return 'none';
      }
    }};
    border-radius: ${({ variant, theme }) => {
      switch (variant) {
        case 'default':
          return theme.border.radius.sm;
        case 'with-header':
          return `0 0 ${theme.border.radius.sm} ${theme.border.radius.sm}`;
        default:
          return '0';
      }
    }};
    border-top: ${({ variant, theme }) => {
      if (variant === 'with-header') return 'none';
      if (variant === 'default')
        return `1px solid ${theme.border.color.medium}`;
      return 'none';
    }};
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
  const { theme } = useContext(ThemeContext);
  const [monaco, setMonaco] = useState<Monaco | undefined>(undefined);
  const [editor, setEditor] = useState<
    editor.IStandaloneCodeEditor | undefined
  >(undefined);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

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

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (isEditorFocused) {
      event.stopPropagation();
    }
  };

  return isLoading ? (
    <StyledEditorLoader theme={theme} height={height} variant={variant}>
      <Loader />
    </StyledEditorLoader>
  ) : (
    <StyledCodeEditorContainer onKeyDown={handleKeyDown}>
      <input
        type="hidden"
        data-testid="code-editor-value"
        value={value ?? ''}
        readOnly
      />
      <StyledEditorWrapper
        theme={theme}
        variant={variant}
        transparentBackground={transparentBackground}
      >
        <Editor
          height={height}
          value={value}
          language={language}
          loading=""
          onMount={(editor, monaco) => {
            setMonaco(monaco);
            setEditor(editor);

            monaco.editor.defineTheme(
              BASE_CODE_EDITOR_THEME_ID,
              getBaseCodeEditorTheme({
                theme,
              }),
            );
            monaco.editor.setTheme(BASE_CODE_EDITOR_THEME_ID);

            editor.onDidFocusEditorWidget(() => {
              setIsEditorFocused(true);
            });
            editor.onDidBlurEditorWidget(() => {
              setIsEditorFocused(false);
            });

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
            formatOnPaste: true,
            formatOnType: true,
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
      </StyledEditorWrapper>
    </StyledCodeEditorContainer>
  );
};
