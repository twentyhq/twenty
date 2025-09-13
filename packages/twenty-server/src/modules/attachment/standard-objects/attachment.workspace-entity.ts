import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { CustomWorkspaceEntity } from 'src/engine/twenty-orm/custom.workspace-entity';
import { WorkspaceDynamicRelation } from 'src/engine/twenty-orm/decorators/workspace-dynamic-relation.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceGate } from 'src/engine/twenty-orm/decorators/workspace-gate.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { ATTACHMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';
import { NoteWorkspaceEntity } from 'src/modules/note/standard-objects/note.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskWorkspaceEntity } from 'src/modules/task/standard-objects/task.workspace-entity';
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
  name: string;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.fullPath,
    type: FieldMetadataType.TEXT,
    label: msg`Full path`,
    description: msg`Attachment full path`,
    icon: 'IconLink',
  })
  fullPath: string;

  @WorkspaceField({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.TEXT,
    label: msg`Type`,
    description: msg`Attachment type`,
    icon: 'IconList',
  })
  type: string;

  @WorkspaceRelation({
    standardId: ATTACHMENT_STANDARD_FIELD_IDS.author,
    type: RelationType.MANY_TO_ONE,
    label: msg`Author`,
    description: msg`Attachment author`,
    icon: 'IconCircleUser',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'authoredAttachments',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
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
  @WorkspaceGate({
    featureFlag: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
  })
  @WorkspaceIsNullable()
  dashboard: Relation<DashboardWorkspaceEntity> | null;

  @WorkspaceJoinColumn('dashboard')
  @WorkspaceGate({
    featureFlag: FeatureFlagKey.IS_PAGE_LAYOUT_ENABLED,
  })
  dashboardId: string | null;

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
