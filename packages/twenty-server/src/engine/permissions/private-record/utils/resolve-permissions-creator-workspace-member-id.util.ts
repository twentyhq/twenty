/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/private-record/utils/is-record-privacy-applicable.util';

export const resolvePermissionsCreatorWorkspaceMemberId = (
  request: PermissionsRowAccessRequest,
): string | undefined =>
  isRecordPrivacyApplicable(request) &&
  hasCreatedByField({
    flatObjectMetadata: request.flatObjectMetadata,
    flatFieldMetadataMaps: request.environment.flatFieldMetadataMaps,
  })
    ? request.principal.workspaceMember?.id
    : undefined;
