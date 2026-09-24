import { ServiceUnavailableException } from '@nestjs/common';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectLiteral } from 'typeorm';

import { type AgentHistoryStorageContext } from 'src/engine/metadata-modules/ai/ai-history/services/agent-history-storage.service';
import { buildUserWorkspaceIdFromWorkspaceMemberIdSql } from 'src/engine/metadata-modules/ai/ai-history/utils/build-agent-chat-thread-owner-sql.util';
import { getAgentChatThreadOwnerColumn } from 'src/engine/metadata-modules/ai/ai-history/utils/get-agent-chat-thread-owner-column.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { buildFieldMapsFromFlatObjectMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/build-field-maps-from-flat-object-metadata.util';
import { getWorkspaceContext } from 'src/engine/twenty-orm/storage/orm-workspace-context.storage';

export const prepareAgentMessageSenderValues = async (
  values: ObjectLiteral | ObjectLiteral[],
  context: AgentHistoryStorageContext,
  workspaceId: string,
): Promise<ObjectLiteral | ObjectLiteral[]> => {
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

  if (missingFields.length === 0) {
    return values;
  }

  const prepare = async (message: ObjectLiteral): Promise<ObjectLiteral> => {
    const unavailable = () =>
      new ServiceUnavailableException(
        'Chat sender attribution is being upgraded. Please retry shortly.',
      );

    // Workspace upgrades trail server deployment. Legacy messages can recover
    // their owner from the thread, but cannot recover another sender or an app.
    if (
      missingFields.includes('senderApplicationId') &&
      isDefined(message.senderApplicationId)
    ) {
      throw unavailable();
    }

    if (
      missingFields.includes('senderUserWorkspaceId') &&
      isDefined(message.senderUserWorkspaceId)
    ) {
      if (!isNonEmptyString(message.threadId)) {
        throw unavailable();
      }
      const ownerColumn = await getAgentChatThreadOwnerColumn({
        manager: context.manager,
        workspaceId,
        storage: context.storage,
      });
      const [thread]: { userWorkspaceId: string }[] =
        await context.manager.query(
          ownerColumn === 'workspaceMemberId'
            ? `SELECT ${buildUserWorkspaceIdFromWorkspaceMemberIdSql({
                workspaceId,
                workspaceMemberIdSql: 'thread."workspaceMemberId"',
                workspaceIdSql: '$2::uuid',
              })} AS "userWorkspaceId" FROM ${context.table('agentChatThread')} thread WHERE thread.id = $1`
            : `SELECT "userWorkspaceId" FROM ${context.table('agentChatThread')} WHERE id = $1`,
          ownerColumn === 'workspaceMemberId'
            ? [message.threadId, workspaceId]
            : [message.threadId],
        );
      if (thread?.userWorkspaceId !== message.senderUserWorkspaceId) {
        throw unavailable();
      }
    }

    return Object.fromEntries(
      Object.entries(message).filter(
        ([field]) => !missingFields.some((missing) => missing === field),
      ),
    );
  };

  return Array.isArray(values)
    ? Promise.all(values.map(prepare))
    : prepare(values);
};
