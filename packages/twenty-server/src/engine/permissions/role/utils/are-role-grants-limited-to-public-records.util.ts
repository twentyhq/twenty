/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasPrivateRecords } from 'src/engine/permissions/private-record/utils/has-private-records.util';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/record-share/utils/has-hypothetical-record-share.util';

export const areRoleGrantsLimitedToPublicRecords = (
  request: PermissionsRowAccessRequest,
): boolean =>
  hasPrivateRecords(request) && !hasHypotheticalRecordShare(request);
