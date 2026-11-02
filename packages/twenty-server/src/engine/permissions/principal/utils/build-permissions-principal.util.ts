/* @license Enterprise */

import {
  type PermissionsPrincipal,
  type PermissionsPrincipalMainActor,
} from 'src/engine/permissions/principal/types/permissions-principal.type';
import { type RolePermissionConfig } from 'src/engine/permissions/principal/types/role-permission-config.type';
import { buildPermissionsPrincipalRoles } from 'src/engine/permissions/principal/utils/build-permissions-principal-roles.util';

// undefined when the config bypasses permission checks
export const buildPermissionsPrincipal = ({
  workspaceId,
  rolePermissionConfig,
  mainActor,
}: {
  workspaceId: string;
  rolePermissionConfig: RolePermissionConfig;
  mainActor: PermissionsPrincipalMainActor | undefined;
}): PermissionsPrincipal | undefined =>
  'intersectionOf' in rolePermissionConfig
    ? {
        workspaceId,
        ...buildPermissionsPrincipalRoles({
          roleIdsBySource: rolePermissionConfig.intersectionOf,
          mainActor,
        }),
      }
    : undefined;
