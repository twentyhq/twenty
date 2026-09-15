import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

export class WorkflowWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  lastPublishedVersionId: string | null;
  coreWorkflowId: string | null;
  statuses: WorkflowStatus[] | null;
  position: number;
  searchVector: string;
  versions: EntityRelation<WorkflowVersionWorkspaceEntity[]>;
  runs: EntityRelation<WorkflowRunWorkspaceEntity[]>;
  automatedTriggers: EntityRelation<WorkflowAutomatedTriggerWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
}
