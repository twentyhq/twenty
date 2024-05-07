import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WORKSPACE_MEMBER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityObjectMetadata } from 'src/modules/activity/standard-objects/activity.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CommentObjectMetadata } from 'src/modules/activity/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/modules/favorite/standard-objects/favorite.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { TimelineActivityObjectMetadata } from 'src/modules/timeline/standard-objects/timeline-activity.object-metadata';
import { AuditLogObjectMetadata } from 'src/modules/timeline/standard-objects/audit-log.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.workspaceMember,
  namePlural: 'workspaceMembers',
  labelSingular: 'Workspace Member',
  labelPlural: 'Workspace Members',
  description: 'A workspace member',
  icon: 'IconUserCircle',
})
@IsSystem()
@IsNotAuditLogged()
export class WorkspaceMemberObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'Workspace member name',
    icon: 'IconCircleUser',
  })
  name: FullNameMetadata;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.colorScheme,
    type: FieldMetadataType.TEXT,
    label: 'Color Scheme',
    description: 'Preferred color scheme',
    icon: 'IconColorSwatch',
    defaultValue: "'Light'",
  })
  colorScheme: string;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.locale,
    type: FieldMetadataType.TEXT,
    label: 'Language',
    description: 'Preferred language',
    icon: 'IconLanguage',
    defaultValue: "'en'",
  })
  locale: string;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: 'Avatar Url',
    description: 'Workspace member avatar',
    icon: 'IconFileUpload',
  })
  avatarUrl: string;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userEmail,
    type: FieldMetadataType.TEXT,
    label: 'User Email',
    description: 'Related user email address',
    icon: 'IconMail',
  })
  userEmail: string;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userId,
    type: FieldMetadataType.UUID,
    label: 'User Id',
    description: 'Associated User Id',
    icon: 'IconCircleUsers',
  })
  userId: string;

  // Relations
  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredActivities,
    type: FieldMetadataType.RELATION,
    label: 'Authored activities',
    description: 'Activities created by the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityObjectMetadata,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredActivities: Relation<ActivityObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedActivities,
    type: FieldMetadataType.RELATION,
    label: 'Assigned activities',
    description: 'Activities assigned to the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityObjectMetadata,
    inverseSideFieldKey: 'assignee',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  assignedActivities: Relation<ActivityObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.favorites,
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the workspace member',
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => FavoriteObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  favorites: Relation<FavoriteObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.accountOwnerForCompanies,
    type: FieldMetadataType.RELATION,
    label: 'Account Owner For Companies',
    description: 'Account owner for companies',
    icon: 'IconBriefcase',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CompanyObjectMetadata,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForCompanies: Relation<CompanyObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredAttachments,
    type: FieldMetadataType.RELATION,
    label: 'Authored attachments',
    description: 'Attachments created by the workspace member',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredAttachments: Relation<AttachmentObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredComments,
    type: FieldMetadataType.RELATION,
    label: 'Authored comments',
    description: 'Authored comments',
    icon: 'IconComment',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CommentObjectMetadata,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredComments: Relation<CommentObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.connectedAccounts,
    type: FieldMetadataType.RELATION,
    label: 'Connected accounts',
    description: 'Connected accounts',
    icon: 'IconAt',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ConnectedAccountObjectMetadata,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  connectedAccounts: Relation<ConnectedAccountObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageParticipants,
    type: FieldMetadataType.RELATION,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => MessageParticipantObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  messageParticipants: Relation<MessageParticipantObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.blocklist,
    type: FieldMetadataType.RELATION,
    label: 'Blocklist',
    description: 'Blocklisted handles',
    icon: 'IconForbid2',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => BlocklistObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  blocklist: Relation<BlocklistObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: FieldMetadataType.RELATION,
    label: 'Calendar Event Participants',
    description: 'Calendar Event Participants',
    icon: 'IconCalendar',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CalendarEventParticipantObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  calendarEventParticipants: Relation<CalendarEventParticipantObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timelineActivities,
    type: FieldMetadataType.RELATION,
    label: 'Events',
    description: 'Events linked to the workspace member',
    icon: 'IconTimelineEvent',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => TimelineActivityObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  @IsSystem()
  timelineActivities: Relation<TimelineActivityObjectMetadata[]>;

  @FieldMetadata({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.auditLogs,
    type: FieldMetadataType.RELATION,
    label: 'Aud tLogs',
    description: 'Audit Logs linked to the workspace member',
    icon: 'IconTimelineEvent',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AuditLogObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @IsNullable()
  @IsSystem()
  auditLogs: Relation<AuditLogObjectMetadata[]>;
}
