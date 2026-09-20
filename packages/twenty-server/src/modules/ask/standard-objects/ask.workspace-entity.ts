import { type AskSource } from 'src/modules/ask/enums/ask-source.enum';
import { type AskStatus } from 'src/modules/ask/enums/ask-status.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class AskWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  status: AskStatus;
  // The questions are snapshotted rather than read back from the step: a
  // workflow version can be edited or discarded after the Ask goes out, and
  // what someone was asked has to stay what they were asked.
  form: Record<string, unknown> | null;
  response: Record<string, unknown> | null;
  answeredAt: string | null;
  source: AskSource;
  stepId: string | null;
  assignee: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;
  workflowRun: EntityRelation<WorkflowRunWorkspaceEntity> | null;
  workflowRunId: string | null;
}
