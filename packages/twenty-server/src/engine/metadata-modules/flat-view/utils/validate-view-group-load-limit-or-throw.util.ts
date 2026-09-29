import { t } from '@lingui/core/macro';
import { VIEW_GROUP_LOAD_LIMIT_OPTIONS } from 'twenty-shared/constants';
import { isDefined, isSupportedViewGroupLoadLimit } from 'twenty-shared/utils';

import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

export const validateViewGroupLoadLimitOrThrow = (
  groupLoadLimit: number | null | undefined,
): void => {
  if (!isDefined(groupLoadLimit)) {
    return;
  }

  if (isSupportedViewGroupLoadLimit(groupLoadLimit)) {
    return;
  }

  const allowedGroupLoadLimits = VIEW_GROUP_LOAD_LIMIT_OPTIONS.join(', ');

  throw new ViewException(
    t`Unsupported groupLoadLimit ${groupLoadLimit}, expected one of ${allowedGroupLoadLimits}`,
    ViewExceptionCode.INVALID_VIEW_DATA,
  );
};
