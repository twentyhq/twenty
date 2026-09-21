import { type ObjectLiteral } from 'typeorm';
import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

const OBJECT_NAME_BY_RELATION_FIELD: Record<string, AgentHistoryObjectName> = {
  parts: 'agentMessagePart',
  messages: 'agentMessage',
  turns: 'agentTurn',
  evaluations: 'agentTurnEvaluation',
};

export const normalizeAgentHistoryRecord = ({
  record,
  workspaceId,
  objectName,
}: {
  record: ObjectLiteral;
  workspaceId: string;
  objectName: AgentHistoryObjectName;
}): ObjectLiteral => {
  const normalized: ObjectLiteral = { ...record, workspaceId };
  if (objectName === 'agentChatThread') {
    normalized.deletedAt = record.archivedAt ?? null;
    // Workspace text formatting turns SQL NULL into an empty string, which
    // chat stream coordination must not interpret as an active stream claim.
    if (normalized.activeStreamId === '') {
      normalized.activeStreamId = null;
    }
  }
  for (const field of ['createdAt', 'updatedAt', 'deletedAt', 'processedAt']) {
    if (typeof normalized[field] === 'string') {
      normalized[field] = new Date(normalized[field]);
    }
  }
  // Existing GraphQL DTOs use numbers; durable totals are incremented in SQL.
  for (const field of [
    'totalInputCredits',
    'totalOutputCredits',
    'totalCacheReadTokens',
    'totalCacheCreationTokens',
  ]) {
    if (typeof normalized[field] === 'string') {
      normalized[field] = Number(normalized[field]);
    }
  }
  for (const [field, childObjectName] of Object.entries(
    OBJECT_NAME_BY_RELATION_FIELD,
  )) {
    if (Array.isArray(normalized[field])) {
      normalized[field] = normalized[field].map((child: ObjectLiteral) =>
        normalizeAgentHistoryRecord({
          record: child,
          workspaceId,
          objectName: childObjectName,
        }),
      );
    }
  }
  return normalized;
};
