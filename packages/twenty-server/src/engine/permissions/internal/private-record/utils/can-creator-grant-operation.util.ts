/* @license Enterprise */

import { isDefined } from 'twenty-shared/utils';

import { type PermissionsObjectAccessRequest } from 'src/engine/permissions/internal/combine/types/row-access-policy.type';
import { resolvePermissionsCreatorWorkspaceMemberId } from 'src/engine/permissions/internal/private-record/utils/resolve-permissions-creator-workspace-member-id.util';

export const canCreatorGrantOperation = (
  request: PermissionsObjectAccessRequest,
): boolean => isDefined(resolvePermissionsCreatorWorkspaceMemberId(request));
