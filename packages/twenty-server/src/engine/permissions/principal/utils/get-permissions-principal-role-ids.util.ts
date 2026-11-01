/* @license Enterprise */

import { type PermissionsPrincipal } from 'src/engine/permissions/principal/types/permissions-principal.type';
import { getRoleIdsToIntersect } from 'src/engine/permissions/principal/utils/get-role-ids-to-intersect.util';

export const getPermissionsPrincipalRoleIds = (
  principal: PermissionsPrincipal,
): string[] => getRoleIdsToIntersect(principal.intersectionOf) ?? [];
