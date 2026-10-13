import { isNumber } from '@sniptt/guards';
import { useState } from 'react';

import { type ResizedCodeEditorHeight } from './types/ResizedCodeEditorHeight';
import { getCurrentCodeEditorHeight } from './utils/getCurrentCodeEditorHeight';
import { getResizableCodeEditorHeight } from './utils/getResizableCodeEditorHeight';

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
  const resizableHeight = getResizableCodeEditorHeight({
    height,
    resizedHeight,
  });

  return {
    currentHeight: getCurrentCodeEditorHeight({
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
