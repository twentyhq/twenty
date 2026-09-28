import { type AgentHistoryObjectName } from 'src/engine/metadata-modules/ai/ai-history/types/agent-history-object-name.type';

export const mapAgentHistoryFieldNameToWorkspace = (
  objectName: AgentHistoryObjectName,
  fieldName: string,
): string =>
  objectName === 'agentChatThread' && fieldName === 'deletedAt'
    ? 'archivedAt'
    : fieldName;
