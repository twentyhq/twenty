import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const findAgentChatFlatObjectMetadata = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
  standardObjectName: 'agentChatThread' | 'agentChatThreadParticipant',
) =>
  flatObjectMetadataMaps.byUniversalIdentifier[
    STANDARD_OBJECTS[standardObjectName].universalIdentifier
  ];
