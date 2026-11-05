import { isDefined } from 'twenty-shared/utils';

import { AGENT_HISTORY_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/ai/ai-history/constants/agent-history-object-universal-identifiers.constant';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type AgentHistoryObjectMetadataMaps } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-metadata-maps.type';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';

export const resolveAgentHistoryObjectNameOrThrow = ({
  objectName,
  flatObjectMetadataMaps,
}: {
  objectName: AgentHistoryObjectName;
  flatObjectMetadataMaps: AgentHistoryObjectMetadataMaps;
}): string => {
  const universalIdentifier =
    AGENT_HISTORY_OBJECT_UNIVERSAL_IDENTIFIERS[objectName];
  const flatObjectMetadata = findFlatEntityByUniversalIdentifier({
    flatEntityMaps: flatObjectMetadataMaps,
    universalIdentifier,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new AgentHistoryStorageException(
      'RECORD_NOT_FOUND',
      `Agent history object metadata ${universalIdentifier} not found`,
    );
  }

  return flatObjectMetadata.nameSingular;
};
