import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentMessageWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type JSONValue } from 'ai';

export class AgentMessagePartWorkspaceEntity extends BaseWorkspaceEntity {
  message: EntityRelation<AgentMessageWorkspaceEntity>;

  messageId: string;
  orderIndex: number;
  type: string;
  textContent: string | null;
  reasoningContent: string | null;
  toolName: string | null;
  toolCallId: string | null;
  toolInput: unknown | null;
  toolOutput: unknown | null;
  state: string | null;
  providerExecuted: boolean | null;
  errorMessage: string | null;
  errorDetails: Record<string, unknown> | null;
  sourceUrlSourceId: string | null;
  sourceUrlUrl: string | null;
  sourceUrlTitle: string | null;
  sourceDocumentSourceId: string | null;
  sourceDocumentMediaType: string | null;
  sourceDocumentTitle: string | null;
  sourceDocumentFilename: string | null;
  fileFilename: string | null;
  fileId: string | null;
  providerMetadata: Record<string, Record<string, JSONValue>> | null;
}
