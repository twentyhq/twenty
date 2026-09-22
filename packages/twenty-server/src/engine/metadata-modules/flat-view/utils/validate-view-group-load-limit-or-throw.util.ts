import { t } from '@lingui/core/macro';
import { VIEW_GROUP_LOAD_LIMIT_OPTIONS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

import {
  ViewException,
  ViewExceptionCode,
} from 'src/engine/metadata-modules/view/exceptions/view.exception';

// Grouped record queries page on this value and the Group options menu can only preselect a limit it offers, so an unsupported value would leave the view on a limit no one can change from the UI
export const validateViewGroupLoadLimitOrThrow = (
  groupLoadLimit: number | null | undefined,
): void => {
  if (!isDefined(groupLoadLimit)) {
    return;
  }

  if (
    VIEW_GROUP_LOAD_LIMIT_OPTIONS.some((option) => option === groupLoadLimit)
  ) {
    return;
  }

  const allowedGroupLoadLimits = VIEW_GROUP_LOAD_LIMIT_OPTIONS.join(', ');

  throw new ViewException(
    t`Unsupported groupLoadLimit ${groupLoadLimit}, expected one of ${allowedGroupLoadLimits}`,
    ViewExceptionCode.INVALID_VIEW_DATA,
  );
};
