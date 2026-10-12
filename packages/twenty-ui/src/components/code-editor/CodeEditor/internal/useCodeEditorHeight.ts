import { clamp } from '@base-ui/utils/clamp';
import { isNumber } from '@sniptt/guards';
import { type editor } from 'monaco-editor';
import { useEffect, useState } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';
import { RESIZE_HANDLE_DEFAULTS } from '@ui/primitives/layout/ResizeHandle/internal/ResizeHandleDefaults.constant';

import { CODE_EDITOR_DEFAULT_HEIGHT } from './constants/CodeEditorDefaultHeight';

const getBoundedHeight = (height: number) =>
  clamp(height, RESIZE_HANDLE_DEFAULTS.min, RESIZE_HANDLE_DEFAULTS.max);

export const useCodeEditorHeight = ({
  height,
  resizable,
  autoHeight,
  editor,
}: {
  height: number | string;
  resizable: boolean;
  autoHeight: boolean;
  editor: editor.IStandaloneCodeEditor | undefined;
}) => {
  const [resizedHeight, setResizedHeight] = useState<{
    sourceHeight: number | string;
    value: number;
  }>();
  const [contentHeight, setContentHeight] = useState<number>();
  const shouldAutoHeight = autoHeight && !resizable;
  const hasResizedHeight = resizedHeight?.sourceHeight === height;
  const resizableHeight = hasResizedHeight
    ? resizedHeight.value
    : isNumber(height)
      ? getBoundedHeight(height)
      : CODE_EDITOR_DEFAULT_HEIGHT;

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
      value: getBoundedHeight(measuredHeight),
    });
  }, [editor, height, resizable]);

  useEffect(() => {
    if (!shouldAutoHeight || !isDefined(editor)) {
      setContentHeight(undefined);
      return;
    }

    const updateContentHeight = () => {
      const nextHeight = editor.getContentHeight();

      if (!Number.isFinite(nextHeight) || nextHeight <= 0) {
        return;
      }

      setContentHeight(nextHeight);
    };

    updateContentHeight();

    const subscription = editor.onDidContentSizeChange(updateContentHeight);

    return () => subscription.dispose();
  }, [editor, shouldAutoHeight]);

  return {
    currentHeight: resizable
      ? hasResizedHeight || isNumber(height)
        ? resizableHeight
        : height
      : shouldAutoHeight
        ? (contentHeight ?? height)
        : height,
    resizableHeight,
    setResizableHeight: (value: number) => {
      setResizedHeight({ sourceHeight: height, value });
    },
  };
};
