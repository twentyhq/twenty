import { Injectable } from '@nestjs/common';

import { ComparatorAction } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/comparator.interface';

import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ComputedPermissionMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/factories/standard-permission.factory';

export interface PermissionComparatorResult {
  action: ComparatorAction;
  object: ComputedPermissionMetadata;
}

@Injectable()
export class WorkspacePermissionComparator {
  compare(
    standardPermissionMetadata: ComputedPermissionMetadata[],
    existingRoles: RoleEntity[],
  ): PermissionComparatorResult[] {
    const results: PermissionComparatorResult[] = [];

    for (const standardPermission of standardPermissionMetadata) {
      const existingRole = existingRoles.find(
        (role) => role.id === standardPermission.roleId,
      );

      if (!existingRole) {
        results.push({
          action: ComparatorAction.CREATE,
          object: standardPermission,
        });
      } else {
        const needsUpdate = this.rolePropertiesDiffer(
          existingRole,
          standardPermission,
        );

        if (needsUpdate) {
          results.push({
            action: ComparatorAction.UPDATE,
            object: standardPermission,
          });
        }
      }
    }

    return results;
  }

  private rolePropertiesDiffer(
    existing: RoleEntity,
    standard: ComputedPermissionMetadata,
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
