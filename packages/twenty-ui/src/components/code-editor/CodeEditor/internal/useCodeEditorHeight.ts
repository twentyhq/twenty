import { clamp } from '@base-ui/utils/clamp';
import { isNumber } from '@sniptt/guards';
import { useState } from 'react';

import { RESIZE_HANDLE_DEFAULTS } from '@ui/primitives/layout/ResizeHandle/internal/ResizeHandleDefaults.constant';

import { CODE_EDITOR_DEFAULT_HEIGHT } from './constants/CodeEditorDefaultHeight';
import { type ResizedCodeEditorHeight } from './types/ResizedCodeEditorHeight';

const getBoundedHeight = (height: number) =>
  clamp(height, RESIZE_HANDLE_DEFAULTS.min, RESIZE_HANDLE_DEFAULTS.max);

const getResizableHeight = ({
  height,
  resizedHeight,
}: {
  height: number | string;
  resizedHeight: ResizedCodeEditorHeight | undefined;
}) => {
  if (resizedHeight?.sourceHeight === height) {
    return resizedHeight.value;
  }

  if (isNumber(height)) {
    return getBoundedHeight(height);
  }

  return CODE_EDITOR_DEFAULT_HEIGHT;
};

const getCurrentHeight = ({
  height,
  resizableHeight,
  contentHeight,
  shouldUseResizableHeight,
  shouldAutoHeight,
}: {
  height: number | string;
  resizableHeight: number;
  contentHeight: number | undefined;
  shouldUseResizableHeight: boolean;
  shouldAutoHeight: boolean;
}) => {
  if (shouldUseResizableHeight) {
    return resizableHeight;
  }

  if (shouldAutoHeight) {
    return contentHeight ?? height;
  }

  return height;
};

export const useCodeEditorHeight = ({
  height,
  resizable,
  autoHeight,
}: {
  height: number | string;
  resizable: boolean;
  autoHeight: boolean;
}) => {
  const [resizedHeight, setResizedHeight] = useState<ResizedCodeEditorHeight>();
  const [contentHeight, setContentHeight] = useState<number>();
  const shouldAutoHeight = autoHeight && !resizable;
  const hasResizedHeight = resizedHeight?.sourceHeight === height;
  const shouldUseResizableHeight =
    resizable && (hasResizedHeight || isNumber(height));
  const resizableHeight = getResizableHeight({ height, resizedHeight });

  return {
    currentHeight: getCurrentHeight({
      height,
      resizableHeight,
      contentHeight,
      shouldUseResizableHeight,
      shouldAutoHeight,
    }),
    resizableHeight,
    setResizableHeight: (value: number) => {
      setResizedHeight({ sourceHeight: height, value });
    },
    setResizedHeight,
    setContentHeight,
    shouldAutoHeight,
  };
};
