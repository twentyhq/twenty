import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FullNameMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/full-name.composite-type';
import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { WORKSPACE_MEMBER_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ActivityObjectMetadata } from 'src/modules/activity/standard-objects/activity.object-metadata';
import { AttachmentObjectMetadata } from 'src/modules/attachment/standard-objects/attachment.object-metadata';
import { BlocklistObjectMetadata } from 'src/modules/connected-account/standard-objects/blocklist.object-metadata';
import { CalendarEventParticipantObjectMetadata } from 'src/modules/calendar/standard-objects/calendar-event-participant.object-metadata';
import { CommentObjectMetadata } from 'src/modules/activity/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/modules/company/standard-objects/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/modules/favorite/standard-objects/favorite.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/modules/messaging/standard-objects/message-participant.object-metadata';
import { TimelineActivityObjectMetadata } from 'src/modules/timeline/standard-objects/timeline-activity.object-metadata';
import { AuditLogObjectMetadata } from 'src/modules/timeline/standard-objects/audit-log.object-metadata';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-object.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.workspaceMember,
  namePlural: 'workspaceMembers',
  labelSingular: 'Workspace Member',
  labelPlural: 'Workspace Members',
  description: 'A workspace member',
  icon: 'IconUserCircle',
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class WorkspaceMemberObjectMetadata extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.name,
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'Workspace member name',
    icon: 'IconCircleUser',
  })
  name: FullNameMetadata;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.colorScheme,
    type: FieldMetadataType.TEXT,
    label: 'Color Scheme',
    description: 'Preferred color scheme',
    icon: 'IconColorSwatch',
    defaultValue: "'Light'",
  })
  colorScheme: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.locale,
    type: FieldMetadataType.TEXT,
    label: 'Language',
    description: 'Preferred language',
    icon: 'IconLanguage',
    defaultValue: "'en'",
  })
  locale: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: 'Avatar Url',
    description: 'Workspace member avatar',
    icon: 'IconFileUpload',
  })
  avatarUrl: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userEmail,
    type: FieldMetadataType.TEXT,
    label: 'User Email',
    description: 'Related user email address',
    icon: 'IconMail',
  })
  userEmail: string;

  @WorkspaceField({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.userId,
    type: FieldMetadataType.UUID,
    label: 'User Id',
    description: 'Associated User Id',
    icon: 'IconCircleUsers',
  })
  userId: string;

  // Relations
  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Authored activities',
    description: 'Activities created by the workspace member',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityObjectMetadata,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredActivities: Relation<ActivityObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.assignedActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Assigned activities',
    description: 'Activities assigned to the workspace member',
    icon: 'IconCheckbox',
    inverseSideTarget: () => ActivityObjectMetadata,
    inverseSideFieldKey: 'assignee',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  assignedActivities: Relation<ActivityObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.favorites,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Favorites',
    description: 'Favorites linked to the workspace member',
    icon: 'IconHeart',
    inverseSideTarget: () => FavoriteObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  favorites: Relation<FavoriteObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.accountOwnerForCompanies,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Account Owner For Companies',
    description: 'Account owner for companies',
    icon: 'IconBriefcase',
    inverseSideTarget: () => CompanyObjectMetadata,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  accountOwnerForCompanies: Relation<CompanyObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredAttachments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Authored attachments',
    description: 'Attachments created by the workspace member',
    icon: 'IconFileImport',
    inverseSideTarget: () => AttachmentObjectMetadata,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredAttachments: Relation<AttachmentObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.authoredComments,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Authored comments',
    description: 'Authored comments',
    icon: 'IconComment',
    inverseSideTarget: () => CommentObjectMetadata,
    inverseSideFieldKey: 'author',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  authoredComments: Relation<CommentObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.connectedAccounts,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Connected accounts',
    description: 'Connected accounts',
    icon: 'IconAt',
    inverseSideTarget: () => ConnectedAccountObjectMetadata,
    inverseSideFieldKey: 'accountOwner',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  connectedAccounts: Relation<ConnectedAccountObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.messageParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
    inverseSideTarget: () => MessageParticipantObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  messageParticipants: Relation<MessageParticipantObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.blocklist,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Blocklist',
    description: 'Blocklisted handles',
    icon: 'IconForbid2',
    inverseSideTarget: () => BlocklistObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  blocklist: Relation<BlocklistObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.calendarEventParticipants,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Calendar Event Participants',
    description: 'Calendar Event Participants',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarEventParticipantObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  calendarEventParticipants: Relation<CalendarEventParticipantObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.timelineActivities,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Events',
    description: 'Events linked to the workspace member',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => TimelineActivityObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  timelineActivities: Relation<TimelineActivityObjectMetadata[]>;

  @WorkspaceRelation({
    standardId: WORKSPACE_MEMBER_STANDARD_FIELD_IDS.auditLogs,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Audit Logs',
    description: 'Audit Logs linked to the workspace member',
    icon: 'IconTimelineEvent',
    inverseSideTarget: () => AuditLogObjectMetadata,
    onDelete: RelationOnDeleteAction.SET_NULL,
  })
  @WorkspaceIsNullable()
  @WorkspaceIsSystem()
  auditLogs: Relation<AuditLogObjectMetadata[]>;
}
