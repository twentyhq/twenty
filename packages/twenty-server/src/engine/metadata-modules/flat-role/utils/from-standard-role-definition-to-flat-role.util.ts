import { removePropertiesFromRecord } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const fromStandardRoleDefinitionToFlatRole = (
  standardRoleDefinition: StandardRoleDefinition,
  workspaceId: string,
): FlatRole => {
  const createdAt = new Date().toISOString();

  return {
    ...removePropertiesFromRecord(standardRoleDefinition, ['permissionFlags']),
    id: v4(),
    workspaceId,
    universalIdentifier: standardRoleDefinition.standardId || v4(),
    createdAt,
    updatedAt: createdAt,
    permissionFlagIds: [],
    fieldPermissionIds: [],
    objectPermissionIds: [],
    roleTargetIds: [],
  };
};
