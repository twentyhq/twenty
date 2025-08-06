import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-permissions/types/standard-role-definition.interface';

export interface ComputedPermission extends StandardRoleDefinition {
  roleId: string;
  workspaceId: string;
}

@Injectable()
export class StandardPermissionFactory {
  create(
    roleDefinitions: StandardRoleDefinition[],
    context: WorkspaceSyncContext,
    existingRoles: RoleEntity[],
  ): ComputedPermission[] {
    const computedPermissions: ComputedPermission[] = [];

    for (const roleDefinition of roleDefinitions) {
      const existingRole = existingRoles.find(
        (role) => role.label === roleDefinition.label,
      );

      if (existingRole) {
        computedPermissions.push({
          roleId: existingRole.id,
          workspaceId: context.workspaceId,
          ...roleDefinition,
        });
      } else {
        computedPermissions.push({
          roleId: '',
          workspaceId: context.workspaceId,
          ...roleDefinition,
        });
      }
    }

    return computedPermissions;
  }
}
