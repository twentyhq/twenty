import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type InputAskStatus } from 'src/modules/input-ask/enums/input-ask-status.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type FormFieldMetadata } from 'src/modules/workflow/workflow-executor/workflow-actions/form/types/workflow-form-action-settings.type';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class InputAskWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  name: string;
  status: InputAskStatus;
  // The questions are snapshotted rather than read back from the step: a
  // workflow version can be edited or discarded after the Ask goes out, and
  // what someone was asked has to stay what they were asked.
  form: { fields: FormFieldMetadata[] } | null;
  response: Record<string, unknown> | null;
  answeredAt: string | null;
  stepId: string | null;
  toolCallId: string | null;
  thread: EntityRelation<AgentChatThreadWorkspaceEntity> | null;
  threadId: string | null;
  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;
  workflowRun: EntityRelation<WorkflowRunWorkspaceEntity> | null;
  workflowRunId: string | null;
}
