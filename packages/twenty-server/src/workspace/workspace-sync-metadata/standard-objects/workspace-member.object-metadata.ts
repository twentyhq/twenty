import { FullNameMetadata } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { workspaceMemberStandardFieldIds } from 'src/workspace/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/workspace/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { AttachmentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { BlocklistObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/blocklist.object-metadata';
import { CalendarEventAttendeeObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-event-attendee.object-metadata';
import { CommentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.workspaceMember,
  namePlural: 'workspaceMembers',
  labelSingular: 'Workspace Member',
  labelPlural: 'Workspace Members',
  description: 'A workspace member',
  icon: 'IconUserCircle',
})
@IsSystem()
export class WorkspaceMemberObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.name,
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'Workspace member name',
    icon: 'IconCircleUser',
  })
  name: FullNameMetadata;

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.colorScheme,
    type: FieldMetadataType.TEXT,
    label: 'Color Scheme',
    description: 'Preferred color scheme',
    icon: 'IconColorSwatch',
    defaultValue: { value: 'Light' },
  })
  colorScheme: string;

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.locale,
    type: FieldMetadataType.TEXT,
    label: 'Language',
    description: 'Preferred language',
    icon: 'IconLanguage',
    defaultValue: { value: 'en' },
  })
  locale: string;

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.avatarUrl,
    type: FieldMetadataType.TEXT,
    label: 'Avatar Url',
    description: 'Workspace member avatar',
    icon: 'IconFileUpload',
  })
  avatarUrl: string;

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.userEmail,
    type: FieldMetadataType.TEXT,
    label: 'User Email',
    description: 'Related user email address',
    icon: 'IconMail',
  })
  userEmail: string;

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.userId,
    type: FieldMetadataType.UUID,
    label: 'User Id',
    description: 'Associated User Id',
    icon: 'IconCircleUsers',
  })
  userId: string;

  // Relations
  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.authoredActivities,
    type: FieldMetadataType.RELATION,
    label: 'Authored activities',
    description: 'Activities created by the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityObjectMetadata,
    inverseSideFieldKey: 'author',
  })
  authoredActivities: ActivityObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.assignedActivities,
    type: FieldMetadataType.RELATION,
    label: 'Assigned activities',
    description: 'Activities assigned to the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ActivityObjectMetadata,
    inverseSideFieldKey: 'assignee',
  })
  assignedActivities: ActivityObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.favorites,
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
  favorites: FavoriteObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.accountOwnerForCompanies,
    type: FieldMetadataType.RELATION,
    label: 'Account Owner For Companies',
    description: 'Account owner for companies',
    icon: 'IconBriefcase',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CompanyObjectMetadata,
    inverseSideFieldKey: 'accountOwner',
  })
  accountOwnerForCompanies: CompanyObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.authoredAttachments,
    type: FieldMetadataType.RELATION,
    label: 'Authored attachments',
    description: 'Attachments created by the workspace member',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => AttachmentObjectMetadata,
    inverseSideFieldKey: 'author',
  })
  authoredAttachments: AttachmentObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.authoredComments,
    type: FieldMetadataType.RELATION,
    label: 'Authored comments',
    description: 'Authored comments',
    icon: 'IconComment',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CommentObjectMetadata,
    inverseSideFieldKey: 'author',
  })
  authoredComments: CommentObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.connectedAccounts,
    type: FieldMetadataType.RELATION,
    label: 'Connected accounts',
    description: 'Connected accounts',
    icon: 'IconAt',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => ConnectedAccountObjectMetadata,
    inverseSideFieldKey: 'accountOwner',
  })
  connectedAccounts: ConnectedAccountObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.messageParticipants,
    type: FieldMetadataType.RELATION,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => MessageParticipantObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
  })
  messageParticipants: MessageParticipantObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.blocklist,
    type: FieldMetadataType.RELATION,
    label: 'Blocklist',
    description: 'Blocklisted handles',
    icon: 'IconForbid2',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => BlocklistObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
  })
  blocklist: BlocklistObjectMetadata[];

  @FieldMetadata({
    standardId: workspaceMemberStandardFieldIds.calendarEventAttendees,
    type: FieldMetadataType.RELATION,
    label: 'Calendar Event Attendees',
    description: 'Calendar Event Attendees',
    icon: 'IconCalendar',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CalendarEventAttendeeObjectMetadata,
    inverseSideFieldKey: 'workspaceMember',
  })
  @Gate({
    featureFlag: 'IS_CALENDAR_ENABLED',
  })
  calendarEventAttendees: CalendarEventAttendeeObjectMetadata[];
}
