import { styled } from '@linaria/react';
import Editor, { type EditorProps, type Monaco } from '@monaco-editor/react';
import { Loader } from '@ui/feedback/loader/components/Loader';
import { ResizeHandle } from '@ui/layout/resize-handle/components/ResizeHandle';
import { BASE_CODE_EDITOR_THEME_ID } from '@ui/input/code-editor/constants/BaseCodeEditorThemeId';
import { useResizeHandle } from '@ui/layout/resize-handle/hooks/useResizeHandle';
import { getBaseCodeEditorTheme } from '@ui/input/code-editor/theme/utils/getBaseCodeEditorTheme';
import {
  ThemeContext,
  themeCssVariables,
  type ThemeType,
} from '@ui/theme-constants';
import { type editor } from 'monaco-editor';
import { type KeyboardEvent, useContext, useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

type CodeEditorVariant = 'default' | 'with-header' | 'borderless';
type CodeEditorContentPadding = 'default' | 'comfortable';

const getCodeEditorContentPadding = (spacing: string) => {
  const parsedSpacing = Number.parseFloat(spacing);

  return Number.isNaN(parsedSpacing) ? undefined : parsedSpacing;
};

const resolveCssVariable = (value: string) => {
  if (
    value.startsWith('var(') &&
    typeof getComputedStyle === 'function' &&
    typeof document !== 'undefined'
  ) {
    const variableName = value.slice(4, -1);

    return getComputedStyle(document.documentElement)
      .getPropertyValue(variableName)
      .trim();
  }

  return value;
};

const getCssNumber = (value: string | number) => {
  if (typeof value === 'number') {
    return value;
  }

  const parsedValue = Number.parseFloat(resolveCssVariable(value));

  return Number.isFinite(parsedValue) ? parsedValue : undefined;
};

const getCssLengthInPixels = (length: string | number) => {
  if (typeof length === 'number') {
    return length;
  }

  const resolvedLength = resolveCssVariable(length);
  const parsedLength = Number.parseFloat(resolvedLength);

  if (!Number.isFinite(parsedLength)) {
    return undefined;
  }

  if (
    resolvedLength.endsWith('rem') &&
    typeof getComputedStyle === 'function'
  ) {
    const rootFontSize = Number.parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );

    return !Number.isFinite(rootFontSize)
      ? undefined
      : parsedLength * rootFontSize;
  }

  return parsedLength;
};

const getCodeEditorLineHeight = (theme: ThemeType) => {
  const fontSize = getCssLengthInPixels(theme.font.size.md);
  const lineHeight = getCssNumber(theme.text.lineHeight.md);

  return isDefined(fontSize) && isDefined(lineHeight)
    ? fontSize * lineHeight
    : undefined;
};

const getCodeEditorLineCount = (value: string | undefined) =>
  Math.max(value?.split('\n').length ?? 1, 1);

const getMinimumCodeEditorContentHeight = ({
  contentPadding,
  lineCount,
  lineHeight,
}: {
  contentPadding: number | undefined;
  lineCount: number;
  lineHeight: number | undefined;
}) =>
  isDefined(lineHeight) && Number.isFinite(lineHeight) && lineHeight > 0
    ? lineCount * lineHeight + (contentPadding ?? 0) * 2
    : undefined;

const layoutCodeEditor = (
  editor: editor.IStandaloneCodeEditor,
  height: string | number,
) => {
  if (typeof height !== 'number') {
    return;
  }

  const editorElement = editor.getDomNode();
  const width = editorElement?.parentElement?.clientWidth;

  if (!isDefined(width) || width <= 0) {
    return;
  }

  editor.layout({ height, width });
};

const setCodeEditorTheme = (
  monaco: Monaco,
  theme: ThemeType,
  colorScheme: 'light' | 'dark',
) => {
  monaco.editor.defineTheme(
    BASE_CODE_EDITOR_THEME_ID,
    getBaseCodeEditorTheme(theme, colorScheme),
  );
  monaco.editor.setTheme(BASE_CODE_EDITOR_THEME_ID);
};

type CodeEditorProps = Pick<
  EditorProps,
  'value' | 'language' | 'onMount' | 'onValidate' | 'height' | 'options'
> & {
  onChange?: (value: string) => void;
  setMarkers?: (value: string) => editor.IMarkerData[];
  variant?: CodeEditorVariant;
  isLoading?: boolean;
  transparentBackground?: boolean;
  resizable?: boolean;
  contentPadding?: CodeEditorContentPadding;
  autoHeight?: boolean;
};

const StyledEditorLoader = styled.div<{
  height: string | number;
  variant: CodeEditorVariant;
}>`
  align-items: center;
  display: flex;
  height: ${({ height }) =>
    typeof height === 'number' ? `${height}px` : height};
  justify-content: center;
  border: ${({ variant }) =>
    variant === 'borderless'
      ? 'none'
      : `1px solid ${themeCssVariables.border.color.medium}`};
  border-top: ${({ variant }) => {
    if (variant === 'default')
      return `1px solid ${themeCssVariables.border.color.medium}`;
    return 'none';
  }};
  border-radius: ${({ variant }) => {
    switch (variant) {
      case 'default':
        return themeCssVariables.border.radius.sm;
      case 'with-header':
        return `0 0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm}`;
      default:
        return '0';
    }
  }};
  background-color: ${themeCssVariables.background.transparent.lighter};
`;

const StyledCodeEditorContainer = styled.div`
  display: contents;
`;

const StyledEditorWrapper = styled.div<{
  variant: CodeEditorVariant;
  transparentBackground?: boolean;
}>`
  display: contents;

  .monaco-editor {
    outline-width: 0;

    background-color: ${({ transparentBackground }) =>
      !transparentBackground
        ? themeCssVariables.background.secondary
        : 'transparent'};

    border-radius: ${({ variant }) =>
      variant !== 'borderless' ? themeCssVariables.border.radius.sm : '0'};
  }

  .overflow-guard {
    box-sizing: border-box;

    border: ${({ variant }) => {
      switch (variant) {
        case 'default':
        case 'with-header':
          return `1px solid ${themeCssVariables.border.color.medium}`;
        default:
          return 'none';
      }
    }};
    border-radius: ${({ variant }) => {
      switch (variant) {
        case 'default':
          return themeCssVariables.border.radius.sm;
        case 'with-header':
          return `0 0 ${themeCssVariables.border.radius.sm} ${themeCssVariables.border.radius.sm}`;
        default:
          return '0';
      }
    }};
    border-top: ${({ variant }) => {
      if (variant === 'with-header') return 'none';
      if (variant === 'default')
        return `1px solid ${themeCssVariables.border.color.medium}`;
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
  resizable = false,
  contentPadding = 'default',
  autoHeight = false,
}: CodeEditorProps) => {
  const { theme, colorScheme } = useContext(ThemeContext);
  const [monaco, setMonaco] = useState<Monaco | undefined>(undefined);
  const [editor, setEditor] = useState<
    editor.IStandaloneCodeEditor | undefined
  >(undefined);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [autoHeightContentHeight, setAutoHeightContentHeight] = useState<
    number | undefined
  >(undefined);

  const numericHeight = typeof height === 'number' ? height : 450;
  const {
    size: resizableHeight,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
  } = useResizeHandle({
    initialSize: numericHeight,
  });

  const shouldAutoHeight = autoHeight && !resizable;
  const codeEditorPadding = getCodeEditorContentPadding(theme.spacing[4]);
  const minimumAutoHeight = shouldAutoHeight
    ? getMinimumCodeEditorContentHeight({
        contentPadding: codeEditorPadding,
        lineCount: getCodeEditorLineCount(value),
        lineHeight: getCodeEditorLineHeight(theme),
      })
    : undefined;
  const currentHeight = shouldAutoHeight
    ? Math.max(autoHeightContentHeight ?? 0, minimumAutoHeight ?? 0) || height
    : resizable
      ? resizableHeight
      : height;
  const contentPaddingOptions = isDefined(codeEditorPadding)
    ? {
        ...(contentPadding === 'comfortable'
          ? {
              lineDecorationsWidth: codeEditorPadding,
            }
          : {}),
        padding: {
          bottom: codeEditorPadding,
          top: codeEditorPadding,
        },
      }
    : {};
  const { padding: _callerPadding, ...editorOptions } = options ?? {};

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

  useEffect(() => {
    if (!isDefined(monaco)) {
      return;
    }

    setCodeEditorTheme(monaco, theme, colorScheme);
  }, [colorScheme, monaco, theme]);

  useEffect(() => {
    if (!shouldAutoHeight || !isDefined(editor)) {
      return;
    }

    layoutCodeEditor(editor, currentHeight);
  }, [currentHeight, editor, shouldAutoHeight]);

  useEffect(() => {
    if (!shouldAutoHeight || !isDefined(editor) || !isDefined(monaco)) {
      setAutoHeightContentHeight(undefined);
      return;
    }

    const updateAutoHeight = () => {
      const themeLineHeight = getCodeEditorLineHeight(theme);
      const editorLineHeight = editor.getOption(
        monaco.editor.EditorOption.lineHeight,
      );
      const lineHeight =
        isDefined(themeLineHeight) && Number.isFinite(themeLineHeight)
          ? themeLineHeight
          : editorLineHeight;

      if (
        !isDefined(lineHeight) ||
        !Number.isFinite(lineHeight) ||
        lineHeight <= 0
      ) {
        return;
      }

      const lineCount = editor.getModel()?.getLineCount() ?? 1;
      const minimumContentHeight = getMinimumCodeEditorContentHeight({
        contentPadding: codeEditorPadding,
        lineCount,
        lineHeight,
      });
      const nextHeight = Math.max(
        editor.getContentHeight(),
        minimumContentHeight ?? 0,
      );

      setAutoHeightContentHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight,
      );
    };

    updateAutoHeight();

    const disposable = editor.onDidContentSizeChange(updateAutoHeight);

    return () => {
      disposable.dispose();
    };
  }, [codeEditorPadding, editor, monaco, shouldAutoHeight, theme, value]);

  return isLoading ? (
    <StyledEditorLoader height={currentHeight} variant={variant}>
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
        variant={variant}
        transparentBackground={transparentBackground}
      >
        <Editor
          height={currentHeight}
          value={value}
          language={language}
          loading=""
          onMount={(editor, monaco) => {
            setMonaco(monaco);
            setEditor(editor);

            setCodeEditorTheme(monaco, theme, colorScheme);

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
            fontFamily: theme.code.font.family,
            bracketPairColorization: {
              enabled: false,
            },
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'hidden',
              horizontal: 'hidden',
            },
            minimap: {
              enabled: false,
            },
            ...editorOptions,
            ...contentPaddingOptions,
          }}
        />
      </StyledEditorWrapper>
      {resizable && (
        <ResizeHandle
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
        />
      )}
    </StyledCodeEditorContainer>
  );
};
