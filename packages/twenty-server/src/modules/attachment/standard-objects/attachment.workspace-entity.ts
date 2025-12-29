import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  ActorMetadata,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDynamicRelation } from 'src/engine/twenty-orm/decorators/workspace-dynamic-relation.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ATTACHMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
import { WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.attachment,

  namePlural: 'attachments',
  labelSingular: msg`Attachment`,
  labelPlural: msg`Attachments`,
  description: msg`An attachment`,
  icon: STANDARD_OBJECT_ICONS.attachment,
  labelIdentifierStandardId: ATTACHMENT_STANDARD_FIELD_IDS.name,
})
@WorkspaceIsSystem()
export class AttachmentWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`Attachment name`,
    icon: 'IconFileUpload',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  name: string | null;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.fullPath,
    type: FieldMetadataType.TEXT,
    label: msg`Full path`,
    description: msg`Attachment full path`,
    icon: 'IconLink',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  fullPath: string | null;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: msg`Type (deprecated)`,
    description: msg`Attachment type (deprecated - use fileCategory)`,
    icon: 'IconList',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsDeprecated()
  type: string | null;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.fileCategory,
    type: FieldMetadataType.SELECT,
    label: msg`File category`,
    description: msg`Attachment file category`,
    icon: 'IconList',
    options: [
      {
        value: 'ARCHIVE',
        label: 'Archive',
        position: 0,
        color: 'gray',
      },
      {
        value: 'AUDIO',
        label: 'Audio',
        position: 1,
        color: 'pink',
      },
      {
        value: 'IMAGE',
        label: 'Image',
        position: 2,
        color: 'yellow',
      },
      {
        value: 'PRESENTATION',
        label: 'Presentation',
        position: 3,
        color: 'orange',
      },
      {
        value: 'SPREADSHEET',
        label: 'Spreadsheet',
        position: 4,
        color: 'turquoise',
      },
      {
        value: 'TEXT_DOCUMENT',
        label: 'Text Document',
        position: 5,
        color: 'blue',
      },
      {
        value: 'VIDEO',
        label: 'Video',
        position: 6,
        color: 'purple',
      },
      {
        value: 'OTHER',
        label: 'Other',
        position: 7,
        color: 'gray',
      },
    ],
    defaultValue: "'OTHER'",
  })
  @WorkspaceIsFieldUIReadOnly()
  fileCategory: string;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.updatedBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Updated by`,
    icon: 'IconUserCircle',
    description: msg`The workspace member who last updated the record`,
  })
  @WorkspaceIsFieldUIReadOnly()
  updatedBy: ActorMetadata;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.author,
    type: RelationType.MANY_TO_ONE,
    label: msg`Author`,
    description: msg`Attachment author (deprecated - use createdBy)`,
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'authoredAttachments',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  @WorkspaceIsDeprecated()
  author: Relation<WorkspaceMemberWorkspaceEntity> | null;

  @WorkspaceJoinColumn('author')
  authorId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.task,
    type: RelationType.MANY_TO_ONE,
    label: msg`Task`,
    description: msg`Attachment task`,
    icon: 'IconNotes',
    inverseSideTarget: () => TaskWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  task: Relation<TaskWorkspaceEntity> | null;

  @WorkspaceJoinColumn('task')
  taskId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.note,
    type: RelationType.MANY_TO_ONE,
    label: msg`Note`,
    description: msg`Attachment note`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  note: Relation<NoteWorkspaceEntity> | null;

  @WorkspaceJoinColumn('note')
  noteId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.person,
    type: RelationType.MANY_TO_ONE,
    label: msg`Person`,
    description: msg`Attachment person`,
    icon: 'IconUser',
    inverseSideTarget: () => PersonWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  person: Relation<PersonWorkspaceEntity> | null;

  @WorkspaceJoinColumn('person')
  personId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Attachment company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.opportunity,
    type: RelationType.MANY_TO_ONE,
    label: msg`Opportunity`,
    description: msg`Attachment opportunity`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  opportunity: Relation<OpportunityWorkspaceEntity> | null;

  @WorkspaceJoinColumn('opportunity')
  opportunityId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.dashboard,
    type: RelationType.MANY_TO_ONE,
    label: msg`Dashboard`,
    description: msg`Attachment dashboard`,
    icon: 'IconLayout',
    inverseSideTarget: () => DashboardWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  dashboard: Relation<DashboardWorkspaceEntity> | null;

  @WorkspaceJoinColumn('dashboard')
  dashboardId: string | null;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.workflow,
    type: RelationType.MANY_TO_ONE,
    label: msg`Workflow`,
    description: msg`Attachment workflow`,
    icon: 'IconSettingsAutomation',
    inverseSideTarget: () => WorkflowWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  workflow: Relation<WorkflowWorkspaceEntity> | null;

  @WorkspaceJoinColumn('workflow')
  workflowId: string | null;

  // todo: remove this decorator and the custom field
  @WorkspaceDynamicRelation({
    type: RelationType.MANY_TO_ONE,
    argsFactory: (oppositeObjectMetadata) => ({
      standardId: ATTACHMENT_STANDARD_FIELD_IDS.custom,
      name: oppositeObjectMetadata.nameSingular,
      label: oppositeObjectMetadata.labelSingular,
      description: `Attachment ${oppositeObjectMetadata.labelSingular}`,
      joinColumn: `${oppositeObjectMetadata.nameSingular}Id`,
      icon: 'IconBuildingSkyscraper',
    }),
    inverseSideTarget: () => CustomWorkspaceEntity,
    inverseSideFieldKey: 'attachments',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  custom: Relation<CustomWorkspaceEntity>;
}
