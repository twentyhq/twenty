import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowVersionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
}

export class WorkflowVersionWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  coreWorkflowVersionId: string | null;
  status: WorkflowVersionStatus;
  position: number;
  searchVector: string;
  workflow: EntityRelation<WorkflowWorkspaceEntity>;
  workflowId: string;
  runs: EntityRelation<WorkflowRunWorkspaceEntity>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
}
