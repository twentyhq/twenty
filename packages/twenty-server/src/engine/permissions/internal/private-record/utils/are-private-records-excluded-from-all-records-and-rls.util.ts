/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { arePrivateRecordsApplicable } from 'src/engine/permissions/internal/private-record/utils/are-private-records-applicable.util';
import { hasHypotheticalRecordShare } from 'src/engine/permissions/internal/record-share/utils/has-hypothetical-record-share.util';

export const arePrivateRecordsExcludedFromAllRecordsAndRls = (
  request: PermissionsRowAccessRequest,
): boolean =>
  arePrivateRecordsApplicable(request) && !hasHypotheticalRecordShare(request);
