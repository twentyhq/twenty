import { Injectable } from '@nestjs/common';

import { type WorkspaceSyncContext } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/workspace-sync-context.interface';

import { FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { fromStandardRoleDefinitionToFlatRole } from 'src/engine/metadata-modules/flat-role/utils/from-standard-role-definition-to-flat-role.util';
import { type RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

@Injectable()
export class StandardRoleFactory {
  create(
    roleDefinitions: StandardRoleDefinition[],
    context: WorkspaceSyncContext,
    existingRoles: RoleEntity[],
  ): FlatRole[] {
    const computedRoles: FlatRole[] = [];

    for (const roleDefinition of roleDefinitions) {
      const existingRole = existingRoles.find(
        (role) => role.standardId === roleDefinition.standardId,
      );

      const flatRole = fromStandardRoleDefinitionToFlatRole(
        roleDefinition,
        context.workspaceId,
      );

      if (existingRole) {
        computedRoles.push({
          ...flatRole,
          id: existingRole.id,
          universalIdentifier: roleDefinition.standardId || existingRole.id,
          createdAt: existingRole.createdAt.toISOString(),
        });
      } else {
        computedRoles.push({
          ...flatRole,
          universalIdentifier: roleDefinition.standardId,
        });
      }
    }

    return computedRoles;
  }
}
