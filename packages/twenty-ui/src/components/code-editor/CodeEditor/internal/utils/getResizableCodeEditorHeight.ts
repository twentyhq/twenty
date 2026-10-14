import { isNumber } from '@sniptt/guards';

import { CODE_EDITOR_DEFAULT_HEIGHT } from '../constants/CodeEditorDefaultHeight';
import { type ResizedCodeEditorHeight } from '../types/ResizedCodeEditorHeight';
import { getBoundedCodeEditorHeight } from './getBoundedCodeEditorHeight';

export const getResizableCodeEditorHeight = ({
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
    return getBoundedCodeEditorHeight(height);
  }

  return CODE_EDITOR_DEFAULT_HEIGHT;
};
