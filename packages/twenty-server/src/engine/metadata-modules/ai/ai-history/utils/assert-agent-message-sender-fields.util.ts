import { ServiceUnavailableException } from '@nestjs/common';
import { isDefined } from 'twenty-shared/utils';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

export const assertAgentMessageSenderFields = (): void => {
  const {
    flatObjectMetadataMaps,
    flatFieldMetadataMaps,
    objectIdByNameSingular,
  } = getWorkspaceContext();
  const object = findFlatEntityByIdInFlatEntityMapsOrThrow({
    flatEntityId: objectIdByNameSingular.agentMessage,
    flatEntityMaps: flatObjectMetadataMaps,
  });
  const { fieldIdByName } = buildFieldMapsFromFlatObjectMetadata(
    flatFieldMetadataMaps,
    object,
  );
  const missingFields = (
    ['senderUserWorkspaceId', 'senderApplicationId'] as const
  ).filter((field) => !isDefined(fieldIdByName[field]));

  if (missingFields.length > 0) {
    throw new ServiceUnavailableException(
      'Chat sender attribution is not ready. Complete upgrade:2-43:attribute-chat-message-senders for this workspace and retry.',
    );
  }
};
