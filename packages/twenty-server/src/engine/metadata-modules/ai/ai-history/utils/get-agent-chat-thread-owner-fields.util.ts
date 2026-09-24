import { isDefined } from 'twenty-shared/utils';

import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

export type AgentChatThreadOwnerFields = {
  hasUserWorkspaceIdField: boolean;
  hasWorkspaceMemberField: boolean;
};

export const getAgentChatThreadOwnerFields = (): AgentChatThreadOwnerFields => {
  const {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular,
  } = getWorkspaceContext();
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: objectIdByNameSingular.agentChatThread,
      flatEntityMaps: flatObjectMetadataMaps,
    }),
  );

  return {
    hasUserWorkspaceIdField: isDefined(fieldIdByName.userWorkspaceId),
    hasWorkspaceMemberField: isDefined(fieldIdByName.workspaceMember),
  };
};
