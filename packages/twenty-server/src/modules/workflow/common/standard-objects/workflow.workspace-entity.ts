import { type ActorMetadata, FieldMetadataType } from 'twenty-shared/types';

import { type Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkflowAutomatedTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-automated-trigger.workspace-entity';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

export enum WorkflowStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  DEACTIVATED = 'DEACTIVATED',
}

const NAME_FIELD_NAME = 'name';

export const SEARCH_FIELDS_FOR_WORKFLOWS: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class WorkflowWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  lastPublishedVersionId: string | null;
  statuses: WorkflowStatus[] | null;
  position: number;
  searchVector: string;
  versions: Relation<WorkflowVersionWorkspaceEntity[]>;
  runs: Relation<WorkflowRunWorkspaceEntity[]>;
  automatedTriggers: Relation<WorkflowAutomatedTriggerWorkspaceEntity[]>;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
  attachments: Relation<AttachmentWorkspaceEntity[]>;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
}
