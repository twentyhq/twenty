import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { ActivityTargetObjectMetadata } from 'src/modules/activity/standard-objects/activity-target.object-metadata';
import { FavoriteObjectMetadata } from 'src/modules/favorite/standard-objects/favorite.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { TimelineActivityObjectMetadata } from 'src/modules/timeline/standard-objects/timeline-activity.object-metadata';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { WorkspaceCustomObject } from 'src/engine/twenty-orm/decorators/workspace-custom-object.decorator';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

@WorkspaceCustomObject()
export class CustomWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
    label: 'Name',
    description: 'Name',
    type: FieldMetadataType.TEXT,
    icon: 'IconAbc',
    defaultValue: "'Untitled'",
  })
  name: string;

  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.position,
    label: 'Position',
    description: 'Position',
    type: FieldMetadataType.POSITION,
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.activityTargets,
    label: 'Activities',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Activities tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityTargetObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  activityTargets: ActivityTargetObjectMetadata[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.favorites,
    label: 'Favorites',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Favorites tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: FavoriteObjectMetadata[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.attachments,
    label: 'Attachments',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Attachments tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: AttachmentObjectMetadata[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.timelineActivities,
    label: 'Timeline Activities',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Timeline Activities tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: TimelineActivityObjectMetadata[];
}
