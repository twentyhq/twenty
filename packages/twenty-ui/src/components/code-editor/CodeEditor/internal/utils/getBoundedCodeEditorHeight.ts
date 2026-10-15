import { clamp } from '@base-ui/utils/clamp';

import { RESIZE_HANDLE_DEFAULTS } from '@ui/primitives/layout/ResizeHandle/internal/ResizeHandleDefaults.constant';

export const getBoundedCodeEditorHeight = (height: number) =>
  clamp(height, RESIZE_HANDLE_DEFAULTS.min, RESIZE_HANDLE_DEFAULTS.max);
