/* @license Enterprise */

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { hasCreatedByField } from 'src/engine/permissions/internal/record-permission-repository/utils/has-created-by-field.util';
import { isRecordPrivacyApplicable } from 'src/engine/permissions/internal/private-record/utils/is-record-privacy-applicable.util';
import { isPermissionMainPrincipalWorkspaceMember } from 'src/engine/permissions/internal/principal/utils/is-permission-main-principal-workspace-member.util';

export const resolvePermissionsCreatorWorkspaceMemberId = (
  request: PermissionsObjectAccessRequest,
): string | undefined =>
  isRecordPrivacyApplicable(request) &&
  hasCreatedByField({
    flatObjectMetadata: request.flatObjectMetadata,
    flatFieldMetadataMaps: request.metadataMaps.flatFieldMetadataMaps,
  }) &&
  isPermissionMainPrincipalWorkspaceMember(request.principals.mainPrincipal)
    ? request.principals.mainPrincipal.workspaceMemberId
    : undefined;
