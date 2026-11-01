/* @license Enterprise */

import { msg } from '@lingui/core/macro';
import { type FeatureFlagKey } from 'twenty-shared/types';

import { isPrivateRecordEnabled } from 'src/engine/permissions/private-record/utils/is-private-record-enabled.util';
import {
  RecordShareException,
  RecordShareExceptionCode,
} from 'src/engine/permissions/record-share/record-share.exception';

export const assertPrivateRecordEnabledOrThrow = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): void => {
  if (isPrivateRecordEnabled(featureFlagsMap)) {
    return;
  }

  throw new RecordShareException(
    'Private records are not enabled for this workspace yet',
    RecordShareExceptionCode.INVALID_SHARE_WITH,
    {
      userFriendlyMessage: msg`Private records are not available in this workspace yet.`,
    },
  );
};
