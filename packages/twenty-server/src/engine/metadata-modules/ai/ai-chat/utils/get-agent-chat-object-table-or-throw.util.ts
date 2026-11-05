import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata-maps.type';
import { resolveAgentChatObjectMetadataOrThrow } from 'src/engine/metadata-modules/ai/ai-chat/utils/resolve-agent-chat-object-metadata-or-throw.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { escapeIdentifier } from 'src/engine/workspace-manager/workspace-migration/utils/remove-sql-injection.util';

export const getAgentChatObjectTableOrThrow = ({
  workspaceId,
  objectName,
  flatObjectMetadataMaps,
}: {
  workspaceId: string;
  objectName: Parameters<
    typeof resolveAgentChatObjectMetadataOrThrow
  >[0]['objectName'];
  flatObjectMetadataMaps: Pick<FlatObjectMetadataMaps, 'byUniversalIdentifier'>;
}) => {
  const objectMetadata = resolveAgentChatObjectMetadataOrThrow({
    objectName,
    flatObjectMetadataMaps,
  });

  return `${escapeIdentifier(getWorkspaceSchemaName(workspaceId))}.${escapeIdentifier(computeObjectTargetTable(objectMetadata))}`;
};
