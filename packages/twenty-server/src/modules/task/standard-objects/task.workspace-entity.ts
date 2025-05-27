import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { RichTextV2Metadata } from 'src/engine/metadata-modules/field-metadata/composite-types/rich-text-v2.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { TASK_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
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

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.task,
  namePlural: 'tasks',
  labelSingular: msg`Task`,
  labelPlural: msg`Tasks`,
  description: msg`A task`,
  icon: STANDARD_OBJECT_ICONS.task,
  shortcut: 'T',
  labelIdentifierStandardId: TASK_STANDARD_FIELD_IDS.title,
})
@WorkspaceIsSearchable()
export class TaskWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Task record position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: msg`Title`,
    description: msg`Task title`,
    icon: 'IconNotes',
  })
  title: string;

  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.body,
    type: FieldMetadataType.RICH_TEXT,
    label: msg`Body (deprecated)`,
    description: msg`Task body`,
    icon: 'IconFilePencil',
  })
  @WorkspaceIsNullable()
  body: string | null;

  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.bodyV2,
    type: FieldMetadataType.RICH_TEXT_V2,
    label: msg`Body`,
    description: msg`Task body`,
    icon: 'IconFilePencil',
  })
  @WorkspaceIsNullable()
  bodyV2: RichTextV2Metadata | null;

  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.dueAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Due Date`,
    description: msg`Task due date`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  dueAt: Date | null;

  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`Task status`,
    icon: 'IconCheck',
    defaultValue: "'TODO'",
    options: [
      { value: 'TODO', label: 'To do', position: 0, color: 'sky' },
      {
        value: 'IN_PROGRESS',
        label: 'In progress',
        position: 1,
        color: 'purple',
      },
      {
        value: 'DONE',
        label: 'Done',
        position: 2,
        color: 'green',
      },
    ],
  })
  @WorkspaceIsNullable()
  status: string | null;

  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: TASK_STANDARD_FIELD_IDS.taskTargets,
    label: msg`Relations`,
    description: msg`Task targets`,
    icon: 'IconArrowUpRight',
    type: RelationType.ONE_TO_MANY,
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: TASK_STANDARD_FIELD_IDS.attachments,
    label: msg`Attachments`,
    description: msg`Task attachments`,
    icon: 'IconFileImport',
    type: RelationType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: TASK_STANDARD_FIELD_IDS.assignee,
    label: msg`Assignee`,
    description: msg`Task assignee`,
    icon: 'IconUserCircle',
    type: RelationType.MANY_TO_ONE,
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'assignedTasks',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  assignee: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('assignee')
  assigneeId: string | null;

  @WorkspaceRelation({
    standardId: TASK_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the task.`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: TASK_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the task`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: TASK_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_TASKS,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  searchVector: any;
}
