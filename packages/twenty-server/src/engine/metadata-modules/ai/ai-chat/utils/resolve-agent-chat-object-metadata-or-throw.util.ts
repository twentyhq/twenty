import { isDefined } from 'twenty-shared/utils';

import { findAgentChatFlatObjectMetadata } from 'src/engine/metadata-modules/ai/ai-chat/utils/find-agent-chat-flat-object-metadata.util';
import { AgentHistoryStorageException } from 'src/engine/metadata-modules/ai/ai-history/exceptions/agent-history-storage.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';

export const resolveAgentChatObjectMetadataOrThrow = ({
  objectName,
  flatObjectMetadataMaps,
}: {
  objectName: Parameters<
    typeof findAgentChatFlatObjectMetadata
  >[0]['standardObjectName'];
  flatObjectMetadataMaps: Pick<FlatObjectMetadataMaps, 'byUniversalIdentifier'>;
}) => {
  const objectMetadata = findAgentChatFlatObjectMetadata({
    flatObjectMetadataMaps,
    standardObjectName: objectName,
  });

  if (!isDefined(objectMetadata)) {
    throw new AgentHistoryStorageException(
      'RECORD_NOT_FOUND',
      `Inbox object metadata ${objectName} not found`,
    );
  }

  return objectMetadata;
};
