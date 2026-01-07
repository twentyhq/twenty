import {
  ActorMetadata,
  FieldMetadataType,
  type RichTextV2Metadata,
} from 'twenty-shared/types';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const TITLE_FIELD_NAME = 'title';
const BODY_V2_FIELD_NAME = 'bodyV2';

export const SEARCH_FIELDS_FOR_TASKS: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: BODY_V2_FIELD_NAME, type: FieldMetadataType.RICH_TEXT_V2 },
];

export class TaskWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  title: string | null;
  bodyV2: RichTextV2Metadata | null;
  dueAt: Date | null;
  status: string | null;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;
  attachments: Relation<AttachmentWorkspaceEntity[]>;
  assignee: Relation<WorkspaceMemberWorkspaceEntity> | null;
  assigneeId: string | null;
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
  searchVector: string;
}
