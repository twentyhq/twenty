import { isNumber } from '@sniptt/guards';
import { type CSSProperties } from 'react';

import { isDefined } from '@ui/utilities/utils/isDefined';

export const formatInlineBlockSize = (
  blockSize: CSSProperties['blockSize'],
): string => {
  if (!isDefined(blockSize)) {
    return '';
  }

  return isNumber(blockSize) ? `${blockSize}px` : String(blockSize);
};
