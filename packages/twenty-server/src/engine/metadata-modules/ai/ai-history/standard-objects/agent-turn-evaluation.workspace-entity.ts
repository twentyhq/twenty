import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AgentTurnWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-turn.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class AgentTurnEvaluationWorkspaceEntity extends BaseWorkspaceEntity {
  turn: EntityRelation<AgentTurnWorkspaceEntity>;

  turnId: string;
  score: number;
  comment: string | null;
}
