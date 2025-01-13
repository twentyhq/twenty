import { FieldMetadataType } from 'twenty-shared';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import {
  ActorMetadata,
  FieldActorSource,
} from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/object-metadata.constants';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceCustomEntity } from 'src/engine/twenty-orm/decorators/workspace-custom-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
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
@WorkspaceCustomEntity()
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
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

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

  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_CUSTOM_OBJECT,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  [SEARCH_VECTOR_FIELD.name]: any;
}
