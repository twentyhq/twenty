import { msg } from '@lingui/core/macro';
import {
  ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata.constants';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceCustomEntity } from 'src/engine/twenty-orm/decorators/workspace-custom-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import {
  type FieldTypeAndNameMetadata,
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
    label: msg`Name`,
    description: msg`Name`,
    type: FieldMetadataType.TEXT,
    icon: 'IconAbc',
  })
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.position,
    label: msg`Position`,
    description: msg`Position`,
    type: FieldMetadataType.POSITION,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  @WorkspaceIsFieldUIReadOnly()
  position: number;

  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.updatedBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Updated by`,
    icon: 'IconUserCircle',
    description: msg`The workspace member who last updated the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  updatedBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.noteTargets,
    label: msg`Notes`,
    type: RelationType.ONE_TO_MANY,
    description: (objectMetadata) => {
      const label = objectMetadata.labelSingular;

      return msg`Notes tied to the ${label}`;
    },
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  noteTargets: NoteTargetWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.taskTargets,
    label: msg`Tasks`,
    type: RelationType.ONE_TO_MANY,
    description: (objectMetadata) => {
      const label = objectMetadata.labelSingular;

      return msg`Tasks tied to the ${label}`;
    },
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  taskTargets: TaskTargetWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.favorites,
    label: msg`Favorites`,
    type: RelationType.ONE_TO_MANY,
    description: (objectMetadata) => {
      const label = objectMetadata.labelSingular;

      return msg`Favorites tied to the ${label}`;
    },
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: FavoriteWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.attachments,
    label: msg`Attachments`,
    type: RelationType.ONE_TO_MANY,
    description: (objectMetadata) => {
      const label = objectMetadata.labelSingular;

      return msg`Attachments tied to the ${label}`;
    },
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  attachments: AttachmentWorkspaceEntity[];

  @WorkspaceRelation({
    standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.timelineActivities,
    label: msg`Timeline Activities`,
    type: RelationType.ONE_TO_MANY,
    description: (objectMetadata) => {
      const label = objectMetadata.labelSingular;

      return msg`Timeline Activities tied to the ${label}`;
    },
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    inverseSideFieldKey: 'targetCustom',
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
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: string;
}
