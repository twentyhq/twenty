import { Injectable } from '@nestjs/common';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/comparators/comparator-action.enum';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ComputedRole } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-role.factory';

export interface RoleComparatorResult {
  action: ComparatorAction;
  object: ComputedRole;
}

@Injectable()
export class WorkspaceRoleComparator {
  compare(
    standardRoles: ComputedRole[],
    existingRoles: RoleEntity[],
  ): RoleComparatorResult[] {
    const results: RoleComparatorResult[] = [];

    for (const standardRole of standardRoles) {
      const existingRole = existingRoles.find(
        (role) => role.id === standardRole.roleId,
      );

      if (!existingRole) {
        results.push({
          action: ComparatorAction.CREATE,
          object: standardRole,
        });
      } else {
        const needsUpdate = this.rolePropertiesDiffer(
          existingRole,
          standardRole,
        );

        if (needsUpdate) {
          results.push({
            action: ComparatorAction.UPDATE,
            object: standardRole,
          });
        }
      }
    }

    return results;
  }

  private rolePropertiesDiffer(
    existing: RoleEntity,
    standard: ComputedRole,
  ): boolean {
    return (
      existing.label !== standard.label ||
      existing.description !== standard.description ||
      existing.icon !== standard.icon ||
      existing.isEditable !== standard.isEditable ||
      existing.canUpdateAllSettings !== standard.canUpdateAllSettings ||
      existing.canAccessAllTools !== standard.canAccessAllTools ||
      existing.canReadAllObjectRecords !== standard.canReadAllObjectRecords ||
      existing.canUpdateAllObjectRecords !==
        standard.canUpdateAllObjectRecords ||
      existing.canSoftDeleteAllObjectRecords !==
        standard.canSoftDeleteAllObjectRecords ||
      existing.canDestroyAllObjectRecords !==
        standard.canDestroyAllObjectRecords
    );
  }
}
