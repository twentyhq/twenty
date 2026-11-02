import { type CSSProperties } from 'react';

import { formatCssLength } from '@ui/utilities/internal/formatCssLength';
import { isDefined } from '@ui/utilities/utils/isDefined';

export const formatInlineBlockSize = (
  blockSize: CSSProperties['blockSize'],
): string => {
  if (!isDefined(blockSize)) {
    return '';
  }

  return formatCssLength(blockSize);
};
