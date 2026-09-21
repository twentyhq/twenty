import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

// The target is addressed by object metadata id and record id rather than by a
// morph relation leg per object, so a thread attaches to a custom object without
// a column, an index and a per-workspace backfill for every object that exists.
// recordShare carries the same pair for the same reason.
export class AgentChatThreadTargetWorkspaceEntity extends BaseWorkspaceEntity {
  thread: EntityRelation<AgentChatThreadWorkspaceEntity>;
  threadId: string;

  objectMetadataId: string;
  recordId: string;
}
