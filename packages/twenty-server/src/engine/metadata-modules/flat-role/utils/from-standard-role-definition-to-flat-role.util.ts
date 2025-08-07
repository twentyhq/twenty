import { FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const fromStandardRoleDefinitionToFlatRole = (
  standardRoleDefinition: StandardRoleDefinition,
  workspaceId: string,
): FlatRole => {
  return {
    ...standardRoleDefinition,
    id: '',
    workspaceId,
    uniqueIdentifier: standardRoleDefinition.standardId,
  };
};
