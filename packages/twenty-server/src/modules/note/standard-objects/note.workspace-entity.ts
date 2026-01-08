import {
  type ActorMetadata,
  FieldMetadataType,
  type RichTextV2Metadata,
} from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/utils/get-ts-vector-column-expression.util';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { type FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { type NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const TITLE_FIELD_NAME = 'title';
const BODY_V2_FIELD_NAME = 'bodyV2';

export const SEARCH_FIELDS_FOR_NOTES: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: BODY_V2_FIELD_NAME, type: FieldMetadataType.RICH_TEXT_V2 },
];

export class NoteWorkspaceEntity extends BaseWorkspaceEntity {
  position: number;
  title: string;
  bodyV2: RichTextV2Metadata | null;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  noteTargets: EntityRelation<NoteTargetWorkspaceEntity[]>;
  attachments: EntityRelation<AttachmentWorkspaceEntity[]>;
  timelineActivities: EntityRelation<TimelineActivityWorkspaceEntity[]>;
  favorites: EntityRelation<FavoriteWorkspaceEntity[]>;
  searchVector: string;
}
