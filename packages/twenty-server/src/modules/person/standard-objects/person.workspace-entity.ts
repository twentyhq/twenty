import { msg } from '@lingui/core/macro';
import { FieldMetadataType } from 'twenty-shared/types';

import { RelationOnDeleteAction } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-on-delete-action.interface';
import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/constants/search-vector-field.constants';
import { ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { EmailsMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/emails.composite-type';
import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { LinksMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/links.composite-type';
import { PhonesMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/phones.composite-type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceDuplicateCriteria } from 'src/engine/twenty-orm/decorators/workspace-duplicate-criteria.decorator';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceFieldIndex } from 'src/engine/twenty-orm/decorators/workspace-field-index.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsDeprecated } from 'src/engine/twenty-orm/decorators/workspace-is-deprecated.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSearchable } from 'src/engine/twenty-orm/decorators/workspace-is-searchable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsUnique } from 'src/engine/twenty-orm/decorators/workspace-is-unique.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { PERSON_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import {
  FieldTypeAndNameMetadata,
  getTsVectorColumnExpressionFromFields,
} from 'src/engine/workspace-manager/workspace-sync-metadata/utils/get-ts-vector-column-expression.util';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-event-participant.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-participant.workspace-entity';
import { NoteTargetWorkspaceEntity } from 'src/modules/note/standard-objects/note-target.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { TaskTargetWorkspaceEntity } from 'src/modules/task/standard-objects/task-target.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

const NAME_FIELD_NAME = 'name';
const EMAILS_FIELD_NAME = 'emails';
const JOB_TITLE_FIELD_NAME = 'jobTitle';

export const SEARCH_FIELDS_FOR_PERSON: FieldTypeAndNameMetadata[] = [
  { name: NAME_FIELD_NAME, type: FieldMetadataType.FULL_NAME },
  { name: EMAILS_FIELD_NAME, type: FieldMetadataType.EMAILS },
  { name: JOB_TITLE_FIELD_NAME, type: FieldMetadataType.TEXT },
];

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.person,
  namePlural: 'people',
  labelSingular: msg`Person`,
  labelPlural: msg`People`,
  description: msg`A person`,
  icon: STANDARD_OBJECT_ICONS.person,
  shortcut: 'P',
  labelIdentifierStandardId: PERSON_STANDARD_FIELD_IDS.name,
  imageIdentifierStandardId: PERSON_STANDARD_FIELD_IDS.avatarUrl,
})
@WorkspaceDuplicateCriteria([
  ['nameFirstName', 'nameLastName'],
  ['linkedinLinkPrimaryLinkUrl'],
  ['emailsPrimaryEmail'],
])
@WorkspaceIsSearchable()
export class PersonWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: msg`Name`,
    description: msg`Contact’s name`,
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  name: FullNameMetadata | null;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.emails,
    type: FieldMetadataType.EMAILS,
    label: msg`Emails`,
    description: msg`Contact’s Emails`,
    icon: 'IconMail',
  })
  @WorkspaceIsUnique()
  emails: EmailsMetadata;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.linkedinLink,
    type: FieldMetadataType.LINKS,
    label: msg`Linkedin`,
    description: msg`Contact’s Linkedin account`,
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.xLink,
    type: FieldMetadataType.LINKS,
    label: msg`X`,
    description: msg`Contact’s X/Twitter account`,
    icon: 'IconBrandX',
  })
  @WorkspaceIsNullable()
  xLink: LinksMetadata | null;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.jobTitle,
    type: FieldMetadataType.TEXT,
    label: msg`Job Title`,
    description: msg`Contact’s job title`,
    icon: 'IconBriefcase',
  })
  jobTitle: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.phone,
    type: FieldMetadataType.TEXT,
    label: msg`Phone`,
    description: msg`Contact’s phone number`,
    icon: 'IconPhone',
  })
  @WorkspaceIsDeprecated()
  phone: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.phones,
    type: FieldMetadataType.PHONES,
    label: msg`Phones`,
    description: msg`Contact’s phone numbers`,
    icon: 'IconPhone',
  })
  phones: PhonesMetadata;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.city,
    type: FieldMetadataType.TEXT,
    label: msg`City`,
    description: msg`Contact’s city`,
    icon: 'IconMap',
  })
  city: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: msg`Avatar`,
    description: msg`Contact’s avatar`,
    icon: 'IconFileUpload',
  })
  @WorkspaceIsSystem()
  avatarUrl: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: msg`Position`,
    description: msg`Person record Position`,
    icon: 'IconHierarchy2',
    defaultValue: 0,
  })
  @WorkspaceIsSystem()
  position: number;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.createdBy,
    type: FieldMetadataType.ACTOR,
    label: msg`Created by`,
    icon: 'IconCreativeCommonsSa',
    description: msg`The creator of the record`,
  })
  createdBy: ActorMetadata;

  // Relations
  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.company,
    type: RelationType.MANY_TO_ONE,
    label: msg`Company`,
    description: msg`Contact’s company`,
    icon: 'IconBuildingSkyscraper',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'people',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity> | null;

  @WorkspaceJoinColumn('company')
  companyId: string | null;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.pointOfContactForOpportunities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Linked Opportunities`,
    description: msg`List of opportunities for which that person is the point of contact`,
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'pointOfContact',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  pointOfContactForOpportunities: Relation<OpportunityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.taskTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Tasks`,
    description: msg`Tasks tied to the contact`,
    icon: 'IconCheckbox',
    inverseSideTarget: () => TaskTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  taskTargets: Relation<TaskTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.noteTargets,
    type: RelationType.ONE_TO_MANY,
    label: msg`Notes`,
    description: msg`Notes tied to the contact`,
    icon: 'IconNotes',
    inverseSideTarget: () => NoteTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  noteTargets: Relation<NoteTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.favorites,
    type: RelationType.ONE_TO_MANY,
    label: msg`Favorites`,
    description: msg`Favorites linked to the contact`,
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.attachments,
    type: RelationType.ONE_TO_MANY,
    label: msg`Attachments`,
    description: msg`Attachments linked to the contact.`,
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.messageParticipants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Message Participants`,
    description: msg`Message Participants`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => MessageParticipantWorkspaceEntity,
    inverseSideFieldKey: 'person',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsSystem()
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: RelationType.ONE_TO_MANY,
    label: msg`Calendar Event Participants`,
    description: msg`Calendar Event Participants`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventParticipantWorkspaceEntity,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsSystem()
  calendarEventParticipants: Relation<
    CalendarEventParticipantWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationType.ONE_TO_MANY,
    label: msg`Events`,
    description: msg`Events linked to the person`,
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.searchVector,
    type: FieldMetadataType.TS_VECTOR,
    label: SEARCH_VECTOR_FIELD.label,
    description: SEARCH_VECTOR_FIELD.description,
    icon: 'IconUser',
    generatedType: 'STORED',
    asExpression: getTsVectorColumnExpressionFromFields(
      SEARCH_FIELDS_FOR_PERSON,
    ),
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  @WorkspaceFieldIndex({ indexType: IndexType.GIN })
  searchVector: any;
}
