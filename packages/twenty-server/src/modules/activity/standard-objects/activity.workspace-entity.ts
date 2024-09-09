import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ACTIVITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { CommentWorkspaceEntity } from 'src/modules/activity/standard-objects/comment.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.activity,
  namePlural: 'activities',
  labelSingular: 'Atividade',
  labelPlural: 'Atividades',
  description: 'Uma atividade',
  icon: 'IconCheckbox',
  labelIdentifierStandardId: ACTIVITY_STANDARD_FIELD_IDS.title,
})
@WorkspaceIsSystem()
export class ActivityWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.title,
    type: FieldMetadataType.TEXT,
    label: 'Título',
    description: 'Título da atividade',
    icon: 'IconNotes',
  })
  title: string;

  @WorkspaceField({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.body,
    type: FieldMetadataType.TEXT,
    label: 'Corpo',
    description: 'Corpo da atividade',
    icon: 'IconList',
  })
  body: string;

  @WorkspaceField({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: 'Tipo',
    description: 'Tipo de atividade',
    icon: 'IconCheckbox',
    defaultValue: "'Nota'",
  })
  type: string;

  @WorkspaceField({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.reminderAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data de Lembrete',
    description: 'Data de lembrete da atividade',
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  reminderAt: Date | null;

  @WorkspaceField({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.dueAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data de Vencimento',
    description: 'Data de vencimento da atividade',
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  dueAt: Date | null;

  @WorkspaceField({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.completedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Data de Conclusão',
    description: 'Data de conclusão da atividade',
    icon: 'IconCheck',
  })
  @WorkspaceIsNullable()
  completedAt: Date | null;

  @WorkspaceRelation({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.activityTargets,
    label: 'Alvos',
    description: 'Alvos da atividade',
    icon: 'IconCheckbox',
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  activityTargets: Relation<ActivityTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.attachments,
    label: 'Anexos',
    description: 'Anexos da atividade',
    icon: 'IconFileImport',
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.comments,
    label: 'Comentários',
    description: 'Comentários da atividade',
    icon: 'IconComment',
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CommentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  comments: Relation<CommentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.author,
    label: 'Autor',
    description: 'Autor da atividade',
    icon: 'IconUserCircle',
    type: RelationMetadataType.MANY_TO_ONE,
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'authoredActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  author: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('author')
  authorId: string | null;

  @WorkspaceRelation({
    standardId: ACTIVITY_STANDARD_FIELD_IDS.assignee,
    label: 'Responsável',
    description: 'Responsável pela atividade',
    icon: 'IconUserCircle',
    type: RelationMetadataType.MANY_TO_ONE,
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'assignedActivities',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  assignee: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('assignee')
  assigneeId: string | null;
}
