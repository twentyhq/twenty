/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/internal/private-record/utils/is-record-privacy-applicable.util';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/internal/record-share/utils/has-hypothetical-record-share.util';

export const areRoleGrantsLimitedToPublicRecords = (
  request: PermissionsRowAccessRequest,
): boolean =>
  isRecordPrivacyApplicable(request) && !hasHypotheticalRecordShare(request);
