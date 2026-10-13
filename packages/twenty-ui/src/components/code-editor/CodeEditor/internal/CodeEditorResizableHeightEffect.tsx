import { clamp } from '@base-ui/utils/clamp';
import { type editor } from 'monaco-editor';
import { type Dispatch, type SetStateAction, useEffect } from 'react';

import { RESIZE_HANDLE_DEFAULTS } from '@ui/primitives/layout/ResizeHandle/internal/ResizeHandleDefaults.constant';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { type ResizedCodeEditorHeight } from './types/ResizedCodeEditorHeight';

type CodeEditorResizableHeightEffectProps = {
  height: number | string;
  resizable: boolean;
  editor: editor.IStandaloneCodeEditor | undefined;
  setResizedHeight: Dispatch<
    SetStateAction<ResizedCodeEditorHeight | undefined>
  >;
};

export const CodeEditorResizableHeightEffect = ({
  height,
  resizable,
  editor,
  setResizedHeight,
}: CodeEditorResizableHeightEffectProps) => {
  useEffect(() => {
    if (!resizable || !isDefined(editor)) {
      return;
    }

    const measuredHeight = editor
      .getContainerDomNode()
      .parentElement?.getBoundingClientRect().height;

    if (!isDefined(measuredHeight) || measuredHeight <= 0) {
      return;
    }

    setResizedHeight({
      sourceHeight: height,
      value: clamp(
        measuredHeight,
        RESIZE_HANDLE_DEFAULTS.min,
        RESIZE_HANDLE_DEFAULTS.max,
      ),
    });
  }, [editor, height, resizable, setResizedHeight]);

  return null;
};
