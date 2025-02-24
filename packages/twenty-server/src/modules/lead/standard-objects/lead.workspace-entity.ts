import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { LEAD_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/lead-standard-field-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { PersonWorkspaceEntity } from 'src/modules/person/standard-objects/person.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAIL_FIELD_NAME = 'email';
const COMPANY_NAME_FIELD_NAME = 'companyName';

export const SEARCH_FIELDS_FOR_LEAD: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
  { name: EMAIL_FIELD_NAME, type: FieldMetadataType.EMAIL },
  { name: COMPANY_NAME_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.lead,
  namePlural: 'leads',
  labelSingular: msg`Lead`,
  labelPlural: msg`Leads`,
  description: msg`A potential customer or opportunity`,
  icon: STANDARD_OBJECT_ICONS.lead,
  shortcut: 'L',
})
@WorkspaceIsNotAuditLogged()
export class LeadWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.TEXT,
    label: msg`Name`,
    description: msg`The lead's full name`,
    icon: 'IconUser',
  })
  name: string;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.email,
    type: FieldMetadataType.EMAIL,
    label: msg`Email`,
    description: msg`The lead's email address`,
    icon: 'IconMail',
  })
  @WorkspaceIsNullable()
  email: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.phone,
    type: FieldMetadataType.PHONE,
    label: msg`Phone`,
    description: msg`The lead's phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsNullable()
  phone: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.companyName,
    type: FieldMetadataType.TEXT,
    label: msg`Company Name`,
    description: msg`The lead's company name`,
    icon: 'IconBuildingSkyscraper',
  })
  @WorkspaceIsNullable()
  companyName: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.industry,
    type: FieldMetadataType.TEXT,
    label: msg`Industry`,
    description: msg`The lead's company industry`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  industry: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.jobTitle,
    type: FieldMetadataType.TEXT,
    label: msg`Job Title`,
    description: msg`The lead's job title`,
    icon: 'IconBriefcase',
  })
  @WorkspaceIsNullable()
  jobTitle: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.linkedinUrl,
    type: FieldMetadataType.TEXT,
    label: msg`LinkedIn URL`,
    description: msg`The lead's LinkedIn profile URL`,
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinUrl: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.website,
    type: FieldMetadataType.TEXT,
    label: msg`Website`,
    description: msg`The lead's company website`,
    icon: 'IconWorld',
  })
  @WorkspaceIsNullable()
  website: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.source,
    type: FieldMetadataType.SELECT,
    label: msg`Source`,
    description: msg`The source of the lead`,
    icon: 'IconSourceCode',
    options: [
      { value: 'WEBSITE', label: 'Website', position: 0, color: 'green' },
      { value: 'LINKEDIN', label: 'LinkedIn', position: 1, color: 'blue' },
      { value: 'REFERRAL', label: 'Referral', position: 2, color: 'purple' },
      { value: 'EVENT', label: 'Event', position: 3, color: 'yellow' },
      { value: 'OTHER', label: 'Other', position: 4, color: 'gray' },
    ],
    defaultValue: "'WEBSITE'",
  })
  @WorkspaceFieldIndex()
  source: string;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.status,
    type: FieldMetadataType.SELECT,
    label: msg`Status`,
    description: msg`The current status of the lead`,
    icon: 'IconProgressCheck',
    options: [
      { value: 'NEW', label: 'New', position: 0, color: 'blue' },
      { value: 'CONTACTED', label: 'Contacted', position: 1, color: 'yellow' },
      { value: 'QUALIFIED', label: 'Qualified', position: 2, color: 'green' },
      { value: 'UNQUALIFIED', label: 'Unqualified', position: 3, color: 'red' },
      { value: 'CONVERTED', label: 'Converted', position: 4, color: 'purple' },
    ],
    defaultValue: "'NEW'",
  })
  @WorkspaceFieldIndex()
  status: string;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.convertedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Converted At`,
    description: msg`When the lead was converted`,
    icon: 'IconCalendarEvent',
  })
  @WorkspaceIsNullable()
  convertedAt: Date | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.convertedToObjectId,
    type: FieldMetadataType.UUID,
    label: msg`Converted To Object ID`,
    description: msg`ID of the object this lead was converted to`,
    icon: 'IconArrowForward',
  })
  @WorkspaceIsNullable()
  convertedToObjectId: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.convertedToObjectType,
    type: FieldMetadataType.TEXT,
    label: msg`Converted To Object Type`,
    description: msg`Type of object this lead was converted to`,
    icon: 'IconArrowForward',
  })
  @WorkspaceIsNullable()
  convertedToObjectType: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.notes,
    type: FieldMetadataType.TEXT,
    label: msg`Notes`,
    description: msg`Additional notes about the lead`,
    icon: 'IconNotes',
  })
  @WorkspaceIsNullable()
  notes: string | null;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconUserCircle',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.assignedTo,
    type: FieldMetadataType.ACTOR,
    label: msg`Assigned to`,
    icon: 'IconUserCircle',
    description: msg`The user assigned to this lead`,
  })
  @WorkspaceIsNullable()
  assignedTo: ActorMetadata | null;

  @WorkspaceRelation({
    standardId: LEAD_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the lead`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: LEAD_STANDARD_FIELD_IDS.taskTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Tasks`,
    description: msg`Tasks tied to the lead`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: LEAD_STANDARD_FIELD_IDS.noteTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Notes`,
    description: msg`Notes tied to the lead`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: LEAD_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the lead`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: LEAD_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: msg`Timeline Activities`,
    description: msg`Timeline Activities linked to the lead`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: LEAD_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconSearch',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(SEARCH_FIELDS_FOR_LEAD),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: any;
}
