import { getAgentChatObjectTableOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/get-agent-chat-object-table-or-throw.util';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';

export const getAgentMessageReactionTable = ({
  workspaceId,
  flatObjectMetadataMaps,
}: {
  workspaceId: string;
  flatObjectMetadataMaps: Pick<FlatObjectMetadataMaps, 'byUniversalIdentifier'>;
}) =>
  getAgentChatObjectTableOrThrow({
    workspaceId,
    flatObjectMetadataMaps,
    objectName: 'agentMessageReaction',
  });
