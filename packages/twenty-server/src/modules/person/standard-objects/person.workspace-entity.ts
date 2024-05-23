import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { LinkMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/link.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { PERSON_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityTargetWorkspaceEntity } from 'src/modules/activity/standard-objects/activity-target.workspace-entity';
import { AttachmentWorkspaceEntity } from 'src/modules/attachment/standard-objects/attachment.workspace-entity';
import { CalendarEventParticipantWorkspaceEntity } from 'src/modules/calendar/standard-objects/calendar-event-participant.workspace-entity';
import { CompanyWorkspaceEntity } from 'src/modules/company/standard-objects/company.workspace-entity';
import { FavoriteWorkspaceEntity } from 'src/modules/favorite/standard-objects/favorite.workspace-entity';
import { MessageParticipantWorkspaceEntity } from 'src/modules/messaging/standard-objects/message-participant.workspace-entity';
import { OpportunityWorkspaceEntity } from 'src/modules/opportunity/standard-objects/opportunity.workspace-entity';
import { TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.person,
  namePlural: 'people',
  labelSingular: 'Person',
  labelPlural: 'People',
  description: 'A person',
  icon: 'IconUser',
})
export class PersonWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'Contact’s name',
    icon: 'IconUser',
  })
  @WorkspaceIsNullable()
  name: FullNameMetadata;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.email,
    type: FieldMetadataType.EMAIL,
    label: 'Email',
    description: 'Contact’s Email',
    icon: 'IconMail',
  })
  email: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.linkedinLink,
    type: FieldMetadataType.LINK,
    label: 'Linkedin',
    description: 'Contact’s Linkedin account',
    icon: 'IconBrandLinkedin',
  })
  @WorkspaceIsNullable()
  linkedinLink: LinkMetadata;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.xLink,
    type: FieldMetadataType.LINK,
    label: 'X',
    description: 'Contact’s X/Twitter account',
    icon: 'IconBrandX',
  })
  @WorkspaceIsNullable()
  xLink: LinkMetadata;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.jobTitle,
    type: FieldMetadataType.TEXT,
    label: 'Job Title',
    description: 'Contact’s job title',
    icon: 'IconBriefcase',
  })
  jobTitle: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.phone,
    type: FieldMetadataType.TEXT,
    label: 'Phone',
    description: 'Contact’s phone number',
    icon: 'IconPhone',
  })
  phone: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.city,
    type: FieldMetadataType.TEXT,
    label: 'City',
    description: 'Contact’s city',
    icon: 'IconMap',
  })
  city: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: 'Avatar',
    description: 'Contact’s avatar',
    icon: 'IconFileUpload',
  })
  @WorkspaceIsSystem()
  avatarUrl: string;

  @WorkspaceField({
    standardId: PERSON_STANDARD_FIELD_IDS.position,
    type: FieldMetadataType.POSITION,
    label: 'Position',
    description: 'Person record Position',
    icon: 'IconHierarchy2',
  })
  @WorkspaceIsSystem()
  @WorkspaceIsNullable()
  position: number;

  // Relations
  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.company,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Company',
    description: 'Contact’s company',
    icon: 'IconBuildingSkyscraper',
    joinColumn: 'companyId',
    inverseSideTarget: () => CompanyWorkspaceEntity,
    inverseSideFieldKey: 'people',
  })
  @WorkspaceIsNullable()
  company: Relation<CompanyWorkspaceEntity>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.pointOfContactForOpportunities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'POC for Opportunities',
    description: 'Point of Contact for Opportunities',
    icon: 'IconTargetArrow',
    inverseSideTarget: () => OpportunityWorkspaceEntity,
    inverseSideFieldKey: 'pointOfContact',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  pointOfContactForOpportunities: Relation<OpportunityWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.activityTargets,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Activities',
    description: 'Activities tied to the contact',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityTargetWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  activityTargets: Relation<ActivityTargetWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites linked to the contact',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsSystem()
  favorites: Relation<FavoriteWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.attachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Attachments',
    description: 'Attachments linked to the contact.',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  attachments: Relation<AttachmentWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.messageParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
    inverseSideTarget: () => MessageParticipantWorkspaceEntity,
    inverseSideFieldKey: 'person',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsSystem()
  messageParticipants: Relation<MessageParticipantWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: PERSON_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Calendar Event Participants',
    description: 'Calendar Event Participants',
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
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Events',
    description: 'Events linked to the company',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityWorkspaceEntity[]>;
}
