import { FieldMetadataType } from 'twenty-shared/types';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export enum WorkflowVersionStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
  ARCHIVED = 'ARCHIVED',
}

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKFLOW_VERSIONS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class WorkflowVersionWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  trigger: WorkflowTrigger | null;
  steps: WorkflowAction[] | null;
  status: WorkflowVersionStatus;
  position: number;
  searchVector: string;
  workflow: Relation<WorkflowWorkspaceEntity>;
  workflowId: string;
  runs: Relation<WorkflowRunWorkspaceEntity>;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
