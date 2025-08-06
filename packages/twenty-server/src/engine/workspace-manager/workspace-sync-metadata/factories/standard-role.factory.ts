import { Injectable } from '@nestjs/common';

import { WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export interface ComputedRole extends StandardRoleDefinition {
  roleId: string;
  workspaceId: string;
}

@Injectable()
export class StandardRoleFactory {
  create(
    roleDefinitions: StandardRoleDefinition[],
    context: WorkspaceSyncContext,
    existingRoles: RoleEntity[],
  ): ComputedRole[] {
    const computedRoles: ComputedRole[] = [];

    for (const roleDefinition of roleDefinitions) {
      const existingRole = existingRoles.find(
        (role) => role.label === roleDefinition.label,
      );

      if (existingRole) {
        computedRoles.push({
          roleId: existingRole.id,
          workspaceId: context.workspaceId,
          ...roleDefinition,
        });
      } else {
        computedRoles.push({
          roleId: '',
          workspaceId: context.workspaceId,
          ...roleDefinition,
        });
      }
    }

    return computedRoles;
  }
}
