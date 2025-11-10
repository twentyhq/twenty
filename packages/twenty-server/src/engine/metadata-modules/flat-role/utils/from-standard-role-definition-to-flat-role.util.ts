import { v4 } from 'uuid';

import { type FlatRole } from 'src/engine/metadata-modules/flat-role/types/flat-role.type';
import { type StandardRoleDefinition } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-roles/types/standard-role-definition.interface';

export const fromStandardRoleDefinitionToFlatRole = ({
  standardRoleDefinition,
  workspaceId,
  applicationId,
  id = v4(),
}: {
  id?: string;
  applicationId: string;
  standardRoleDefinition: StandardRoleDefinition;
  workspaceId: string;
}): FlatRole => ({
  ...standardRoleDefinition,
  id,
  workspaceId,
  universalIdentifier: standardRoleDefinition.standardId ?? id,
  applicationId,
});
