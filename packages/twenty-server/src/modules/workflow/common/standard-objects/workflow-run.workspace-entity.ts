import { registerEnumType } from '@nestjs/graphql';

import { type ActorMetadata, FieldMetadataType } from 'twenty-shared/types';
import { type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowRunStatus {
  NOT_STARTED = 'NOT_STARTED',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ENQUEUED = 'ENQUEUED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
}

registerEnumType(WorkflowRunStatus, {
  name: 'WorkflowRunStatusEnum',
  description: 'Status of the workflow run',
});

export type StepOutput = {
  id: string;
  output: WorkflowActionOutput;
};

export type WorkflowRunOutput = {
  flow: {
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
  };
  stepsOutput?: Record<string, WorkflowActionOutput>;
  error?: string;
};

export type WorkflowRunState = {
  flow: {
    trigger: WorkflowTrigger;
    steps: WorkflowAction[];
  };
  stepInfos: WorkflowRunStepInfos;
  workflowRunError?: string;
};

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKFLOW_RUNS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class WorkflowRunWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  enqueuedAt: Date | null;
  startedAt: string | null;
  endedAt: string | null;
  status: WorkflowRunStatus;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  state: WorkflowRunState;
  position: number;
  searchVector: string;
  workflowVersion: EntityRelation<WorkflowVersionWorkspaceEntity>;
  workflowVersionId: string;
  workflow: EntityRelation<WorkflowWorkspaceEntity>;
  workflowId: string;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
}
