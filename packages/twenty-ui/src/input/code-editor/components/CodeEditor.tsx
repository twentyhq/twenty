import Editor, { type EditorProps, type Monaco } from '@monaco-editor/react';
import { Loader } from '@ui/feedback/loader/components/Loader';
import { BASE_CODE_EDITOR_THEME_ID } from '@ui/input/code-editor/constants/BaseCodeEditorThemeId';
import { getBaseCodeEditorTheme } from '@ui/input/code-editor/theme/utils/getBaseCodeEditorTheme';
import { ResizeHandle } from '@ui/layout/resize-handle/components/ResizeHandle';
import { useResizeHandle } from '@ui/layout/resize-handle/hooks/useResizeHandle';
import { ThemeContext, type ThemeType } from '@ui/theme-constants';
import { type editor } from 'monaco-editor';
import { type KeyboardEvent, useContext, useEffect, useState } from 'react';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './CodeEditor.module.scss';

type CodeEditorVariant = 'default' | 'with-header' | 'borderless';
type CodeEditorContentPadding = 'default' | 'comfortable';

const getCodeEditorContentPadding = (spacing: string) => {
  const parsedSpacing = Number.parseFloat(spacing);

  return Number.isNaN(parsedSpacing) ? undefined : parsedSpacing;
};

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
  const currentHeight = shouldAutoHeight
    ? (autoHeightContentHeight ?? height)
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
    if (!shouldAutoHeight || !isDefined(editor)) {
      setAutoHeightContentHeight(undefined);
      return;
    }

    const updateAutoHeight = () => {
      const nextHeight = editor.getContentHeight();

      if (!Number.isFinite(nextHeight) || nextHeight <= 0) {
        return;
      }

      setAutoHeightContentHeight((currentHeight) =>
        currentHeight === nextHeight ? currentHeight : nextHeight,
      );
    };

    updateAutoHeight();

    const disposable = editor.onDidContentSizeChange(updateAutoHeight);

    return () => {
      disposable.dispose();
    };
  }, [codeEditorPadding, editor, shouldAutoHeight, value]);

  return isLoading ? (
    <div
      className={styles.editorLoader}
      data-variant={variant}
      style={
        {
          '--code-editor-height':
            typeof currentHeight === 'number'
              ? `${currentHeight}px`
              : currentHeight,
        } as React.CSSProperties
      }
    >
      <Loader />
    </div>
  ) : (
    <div className={styles.container} onKeyDown={handleKeyDown}>
      <input
        type="hidden"
        data-testid="code-editor-value"
        value={value ?? ''}
        readOnly
      />
      <div
        className={styles.editorWrapper}
        data-variant={variant}
        data-transparent-background={transparentBackground || undefined}
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
      </div>
      {resizable && (
        <ResizeHandle
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
        />
      )}
    </div>
  );
};
