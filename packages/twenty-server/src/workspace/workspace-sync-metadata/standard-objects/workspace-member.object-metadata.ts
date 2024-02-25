import { FullNameMetadata } from 'src/metadata/field-metadata/composite-types/full-name.composite-type';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import { RelationMetadataType } from 'src/metadata/relation-metadata/relation-metadata.entity';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsNullable } from 'src/workspace/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { ActivityObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/activity.object-metadata';
import { AttachmentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/attachment.object-metadata';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { BlocklistObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/blocklist.object-metadata';
import { CommentObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/comment.object-metadata';
import { CompanyObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/company.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/connected-account.object-metadata';
import { FavoriteObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/favorite.object-metadata';
import { MessageParticipantObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-participant.object-metadata';

@ObjectMetadata({
  namePlural: 'workspaceMembers',
  labelSingular: 'Workspace Member',
  labelPlural: 'Workspace Members',
  description: 'A workspace member',
  icon: 'IconUserCircle',
})
@IsSystem()
export class WorkspaceMemberObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    type: FieldMetadataType.FULL_NAME,
    label: 'Name',
    description: 'Workspace member name',
    icon: 'IconCircleUser',
  })
  name: FullNameMetadata;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Color Scheme',
    description: 'Preferred color scheme',
    icon: 'IconColorSwatch',
    defaultValue: { value: 'Light' },
  })
  colorScheme: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Language',
    description: 'Preferred language',
    icon: 'IconLanguage',
    defaultValue: { value: 'en' },
  })
  locale: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'Avatar Url',
    description: 'Workspace member avatar',
    icon: 'IconFileUpload',
  })
  avatarUrl: string;

  @FieldMetadata({
    type: FieldMetadataType.TEXT,
    label: 'User Email',
    description: 'Related user email address',
    icon: 'IconMail',
  })
  userEmail: string;

  @FieldMetadata({
    type: FieldMetadataType.UUID,
    label: 'User Id',
    description: 'Associated User Id',
    icon: 'IconCircleUsers',
  })
  userId: string;

  // Relations
  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Authored activities',
    description: 'Activities created by the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'activity',
    inverseSideFieldName: 'author',
  })
  @IsNullable()
  authoredActivities: ActivityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Assigned activities',
    description: 'Activities assigned to the workspace member',
    icon: 'IconCheckbox',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'activity',
    inverseSideFieldName: 'assignee',
  })
  @IsNullable()
  assignedActivities: ActivityObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Favorites',
    description: 'Favorites linked to the workspace member',
    icon: 'IconHeart',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'favorite',
  })
  @IsNullable()
  favorites: FavoriteObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Account Owner For Companies',
    description: 'Account owner for companies',
    icon: 'IconBriefcase',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'company',
    inverseSideFieldName: 'accountOwner',
  })
  @IsNullable()
  accountOwnerForCompanies: CompanyObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Authored attachments',
    description: 'Attachments created by the workspace member',
    icon: 'IconFileImport',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'attachment',
    inverseSideFieldName: 'author',
  })
  @IsNullable()
  authoredAttachments: AttachmentObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Authored comments',
    description: 'Authored comments',
    icon: 'IconComment',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'comment',
    inverseSideFieldName: 'author',
  })
  @IsNullable()
  authoredComments: CommentObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Connected accounts',
    description: 'Connected accounts',
    icon: 'IconAt',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'connectedAccount',
    inverseSideFieldName: 'accountOwner',
  })
  @IsNullable()
  connectedAccounts: ConnectedAccountObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Message Participants',
    description: 'Message Participants',
    icon: 'IconUserCircle',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'messageParticipant',
    inverseSideFieldName: 'workspaceMember',
  })
  @IsNullable()
  messageParticipants: MessageParticipantObjectMetadata[];

  @FieldMetadata({
    type: FieldMetadataType.RELATION,
    label: 'Blocklist',
    description: 'Blocklisted handles',
    icon: 'IconForbid2',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    objectName: 'blocklist',
    inverseSideFieldName: 'workspaceMember',
  })
  @Gate({
    featureFlag: 'IS_BLOCKLIST_ENABLED',
  })
  @IsNullable()
  blocklist: BlocklistObjectMetadata[];
}
