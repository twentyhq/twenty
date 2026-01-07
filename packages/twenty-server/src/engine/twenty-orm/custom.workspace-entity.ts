import { ActorMetadata, FieldMetadataType } from 'twenty-shared/types';

import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata.constants';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

export const SEARCH_FIELDS_FOR_CUSTOM_OBJECT: FieldTypeAndNameMetadata[] = [
  {
    name: DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
    type: FieldMetadataType.TEXT,
  },
];
export class CustomWorkspaceEntity extends BaseWorkspaceEntity {
  name: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  noteTargets: NoteTargetWorkspaceEntity[];
  taskTargets: TaskTargetWorkspaceEntity[];
  favorites: FavoriteWorkspaceEntity[];
  attachments: AttachmentWorkspaceEntity[];
  timelineActivities: TimelineActivityWorkspaceEntity[];
  searchVector: string;
}
