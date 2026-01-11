import {
  type ActorMetadata,
  FieldMetadataType,
  type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CommentTargetWorkspaceEntity } from 'src/modules/comment/standard-objects/comment-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

const BODY_FIELD_NAME = 'body';

export const SEARCH_FIELDS_FOR_COMMENTS: FieldTypeAndNameMetadata[] = [
  { name: BODY_FIELD_NAME, type: FieldMetadataType.RICH_TEXT_V2 },
];

export class CommentWorkspaceEntity extends BaseWorkspaceEntity {
  body: RichTextV2Metadata | null;
  createdBy: ActorMetadata;
  author: EntityRelation<WorkspaceMemberWorkspaceEntity> | null;
  authorId: string | null;
  commentTargets: EntityRelation<CommentTargetWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
}
