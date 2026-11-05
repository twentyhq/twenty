import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

const AGENT_CHAT_OBJECT_UNIVERSAL_IDENTIFIERS = {
  agentChatThread: STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  agentChatThreadParticipant:
    STANDARD_OBJECTS.agentChatThreadParticipant.universalIdentifier,
  agentChatThreadTarget:
    STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
  agentMessageReaction:
    STANDARD_OBJECTS.agentMessageReaction.universalIdentifier,
} as const;

export const findAgentChatFlatObjectMetadata = ({
  flatObjectMetadataMaps,
  standardObjectName,
}: {
  flatObjectMetadataMaps: Pick<FlatObjectMetadataMaps, 'byUniversalIdentifier'>;
  standardObjectName: keyof typeof AGENT_CHAT_OBJECT_UNIVERSAL_IDENTIFIERS;
}) =>
  findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier:
      AGENT_CHAT_OBJECT_UNIVERSAL_IDENTIFIERS[standardObjectName],
  });
