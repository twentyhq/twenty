/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/private-record/utils/is-record-privacy-applicable.util';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/record-share/utils/has-hypothetical-record-share.util';

export const areRoleGrantsLimitedToPublicRecords = (
  request: PermissionsRowAccessRequest,
): boolean =>
  isRecordPrivacyApplicable(request) && !hasHypotheticalRecordShare(request);
