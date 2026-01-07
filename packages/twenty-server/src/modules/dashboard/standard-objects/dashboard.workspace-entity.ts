import { ActorMetadata, FieldMetadataType } from 'twenty-shared/types';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type FieldTypeAndNameMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const TITLE_FIELD_NAME = 'title';

export const SEARCH_FIELDS_FOR_DASHBOARD: FieldTypeAndNameMetadata[] = [
  { name: TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

export class DashboardWorkspaceEntity extends BaseWorkspaceEntity {
  title: string | null;
  pageLayoutId: string | null;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
  favorites: Relation<FavoriteWorkspaceEntity[]>;
  attachments: Relation<AttachmentWorkspaceEntity[]>;
  searchVector: string;
}
