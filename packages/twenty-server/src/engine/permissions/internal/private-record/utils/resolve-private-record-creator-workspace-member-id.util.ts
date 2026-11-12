/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { hasCreatedByField } from 'src/engine/permissions/internal/record-permission-repository/utils/has-created-by-field.util';
import { arePrivateRecordsApplicable } from 'src/engine/permissions/internal/private-record/utils/are-private-records-applicable.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

export const resolvePrivateRecordCreatorWorkspaceMemberId = (
  request: PermissionsObjectAccessRequest,
): string | undefined =>
  arePrivateRecordsApplicable(request) &&
  hasCreatedByField({
    flatObjectMetadata: request.flatObjectMetadata,
    flatFieldMetadataMaps: request.metadataMaps.flatFieldMetadataMaps,
  }) &&
  isPermissionMainPrincipalWorkspaceMember(request.principals.mainPrincipal)
    ? request.principals.mainPrincipal.workspaceMemberId
    : undefined;
