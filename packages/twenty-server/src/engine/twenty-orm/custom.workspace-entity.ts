import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceCustomObject } from 'src/engine/twenty-orm/decorators/workspace-custom-object.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

@WorkspaceCustomObject({
  softDelete: true,
})
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
  position: number | null;

  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: 'Created by',
    icon: 'IconCreativeCommonsSa',
    description: 'The creator of the record',
    defaultValue: {
      source: `'${FieldActorSource.MANUAL}'`,
      name: "''",
    },
  })
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.deletedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Deleted at',
    description: 'Date when the record was deleted',
    icon: 'IconCalendarMinus',
  })
  @WorkspaceIsNullable()
  deletedAt?: Date | null;

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.activityTargets,
    label: 'Activities',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Activities tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  activityTargets: ActivityTargetWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.noteTargets,
    label: 'Notes',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Notes tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  noteTargets: NoteTargetWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.taskTargets,
    label: 'Tasks',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Tasks tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  taskTargets: TaskTargetWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.favorites,
    label: 'Favorites',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Favorites tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: FavoriteWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.attachments,
    label: 'Attachments',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Attachments tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: AttachmentWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.timelineActivities,
    label: 'Timeline Activities',
    type: RelationMetadataType.ONE_TO_MANY,
    description: (objectMetadata) =>
      `Timeline Activities tied to the ${objectMetadata.labelSingular}`,
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: TimelineActivityWorkspaceEntity[];
}
