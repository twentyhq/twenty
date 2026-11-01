/* @license Enterprise */

import { type PermissionsRowAccessRequest } from 'src/engine/permissions/combine/types/row-access-policy.type';
import { hasCreatedByField } from 'src/engine/permissions/private-record/utils/has-created-by-field.util';
import { hasPrivateRecords } from 'src/engine/permissions/private-record/utils/has-private-records.util';

export const resolvePermissionsCreatorWorkspaceMemberId = (
  request: PermissionsRowAccessRequest,
): string | undefined =>
  hasPrivateRecords(request) &&
  hasCreatedByField({
    flatObjectMetadata: request.flatObjectMetadata,
    flatFieldMetadataMaps: request.environment.flatFieldMetadataMaps,
  })
    ? request.subject.workspaceMemberId
    : undefined;
