/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/permissions-access-request.type';
import { resolvePrivateRecordCreatorWorkspaceMemberId } from 'src/engine/permissions/internal/private-record/utils/resolve-private-record-creator-workspace-member-id.util';

export const canPrivateRecordAccessOperation = (
  request: PermissionsObjectAccessRequest,
): boolean => isDefined(resolvePrivateRecordCreatorWorkspaceMemberId(request));
