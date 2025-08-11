import { v4 } from 'uuid';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const fromStandardRoleDefinitionToFlatRole = (
  standardRoleDefinition: StandardRoleDefinition,
  workspaceId: string,
): FlatRole => {
  return {
    ...standardRoleDefinition,
    id: v4(),
    workspaceId,
    uniqueIdentifier: standardRoleDefinition.standardId || v4(),
  };
};
