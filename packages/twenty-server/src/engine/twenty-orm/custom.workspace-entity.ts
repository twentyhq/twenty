import { msg } from '@lingui/core/macro';
import {
  ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { DEFAULT_LABEL_IDENTIFIER_FIELD_NAME } from 'src/engine/metadata-modules/object-metadata/constants/object-metadata.constants';
import { createBaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceCustomEntity } from 'src/engine/twenty-orm/decorators/workspace-custom-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import {
  type FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { v4 } from 'uuid';

export const SEARCH_FIELDS_FOR_CUSTOM_OBJECT: FieldTypeAndNameMetadata[] = [
  {
    name: DEFAULT_LABEL_IDENTIFIER_FIELD_NAME,
    type: FieldMetadataType.TEXT,
  },
];
@WorkspaceCustomEntity()
export class CustomWorkspaceEntity extends createBaseWorkspaceEntity({
  // TODO prastoin they should be deterministic still but not predictable
  id: v4(),
  createdAt: v4(),
  updatedAt: v4(),
  deletedAt: v4(),
}) {
  @WorkspaceField({
    universalIdentifier: v4(),
    label: msg`Name`,
    description: msg`Name`,
    type: FieldMetadataType.TEXT,
    icon: 'IconAbc',
  })
  name: string;

  @WorkspaceField({
    universalIdentifier: v4(),
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
    universalIdentifier: v4(),
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    universalIdentifier: v4(),
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
    universalIdentifier: v4(),
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
    universalIdentifier: v4(),
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
    universalIdentifier: v4(),
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
    universalIdentifier: v4(),
    label: msg`Timeline Activities`,
    type: RelationType.ONE_TO_MANY,
    description: (objectMetadata) => {
      const label = objectMetadata.labelSingular;

      return msg`Timeline Activities tied to the ${label}`;
    },
    icon: 'IconIconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: TimelineActivityWorkspaceEntity[];

  @WorkspaceField({
    universalIdentifier: v4(),
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
  @WorkspaceFieldIndex({
    indexType: IndexType.GIN,
    universalIdentifier: '20202020-8af9-4365-a11e-a039cfd82cf6',
  })
  searchVector: string;
}
