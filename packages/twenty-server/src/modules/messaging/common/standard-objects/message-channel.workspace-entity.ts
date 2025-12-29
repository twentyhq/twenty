import { registerEnumType } from '@nestjs/graphql';

import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { FieldMetadataType, RelationOnDeleteAction } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';
import { MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

export enum MessageChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum MessageChannelSyncStage {
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION',
  MESSAGE_LIST_FETCH_PENDING = 'MESSAGE_LIST_FETCH_PENDING',
  MESSAGE_LIST_FETCH_SCHEDULED = 'MESSAGE_LIST_FETCH_SCHEDULED',
  MESSAGE_LIST_FETCH_ONGOING = 'MESSAGE_LIST_FETCH_ONGOING',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_SCHEDULED = 'MESSAGES_IMPORT_SCHEDULED',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SUBJECT = 'SUBJECT',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

export enum MessageChannelType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
}

export enum MessageChannelContactAutoCreationPolicy {
  SENT_AND_RECEIVED = 'SENT_AND_RECEIVED',
  SENT = 'SENT',
  NONE = 'NONE',
}

export enum MessageFolderImportPolicy {
  ALL_FOLDERS = 'ALL_FOLDERS',
  SELECTED_FOLDERS = 'SELECTED_FOLDERS',
}

export enum MessageChannelPendingGroupEmailsAction {
  GROUP_EMAILS_DELETION = 'GROUP_EMAILS_DELETION',
  GROUP_EMAILS_IMPORT = 'GROUP_EMAILS_IMPORT',
  NONE = 'NONE',
}

registerEnumType(MessageChannelVisibility, {
  name: 'MessageChannelVisibility',
});

registerEnumType(MessageChannelSyncStatus, {
  name: 'MessageChannelSyncStatus',
});

registerEnumType(MessageChannelSyncStage, {
  name: 'MessageChannelSyncStage',
});

registerEnumType(MessageChannelType, {
  name: 'MessageChannelType',
});

registerEnumType(MessageChannelContactAutoCreationPolicy, {
  name: 'MessageChannelContactAutoCreationPolicy',
});

registerEnumType(MessageFolderImportPolicy, {
  name: 'MessageFolderImportPolicy',
});

registerEnumType(MessageChannelPendingGroupEmailsAction, {
  name: 'MessageChannelPendingGroupEmailsAction',
});

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageChannel,

  namePlural: 'messageChannels',
  labelSingular: msg`Message Channel`,
  labelPlural: msg`Message Channels`,
  description: msg`Message Channels`,
  icon: STANDARD_OBJECT_ICONS.messageChannel,
  labelIdentifierStandardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.visibility,
    type: FieldMetadataType.SELECT,
    label: msg`Visibility`,
    description: msg`Visibility`,
    icon: 'IconEyeglass',
    options: [
      {
        value: MessageChannelVisibility.METADATA,
        label: 'Metadata',
        position: 0,
        color: 'green',
      },
      {
        value: MessageChannelVisibility.SUBJECT,
        label: 'Subject',
        position: 1,
        color: 'blue',
      },
      {
        value: MessageChannelVisibility.SHARE_EVERYTHING,
        label: 'Share Everything',
        position: 2,
        color: 'orange',
      },
    ],
    defaultValue: `'${MessageChannelVisibility.SHARE_EVERYTHING}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  visibility: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: msg`Handle`,
    description: msg`Handle`,
    icon: 'IconAt',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  handle: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: msg`Type`,
    description: msg`Channel Type`,
    icon: 'IconMessage',
    options: [
      {
        value: MessageChannelType.EMAIL,
        label: 'Email',
        position: 0,
        color: 'green',
      },
      {
        value: MessageChannelType.SMS,
        label: 'SMS',
        position: 1,
        color: 'blue',
      },
    ],
    defaultValue: `'${MessageChannelType.EMAIL}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  type: string;

  // TODO: Deprecate this field and migrate data to contactAutoCreationFor
  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Contact Auto Creation Enabled`,
    description: msg`Is Contact Auto Creation Enabled`,
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  @WorkspaceIsFieldUIReadOnly()
  isContactAutoCreationEnabled: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
    type: FieldMetadataType.SELECT,
    label: msg`Contact auto creation policy`,
    description: msg`Automatically create People records when receiving or sending emails`,
    icon: 'IconUserCircle',
    options: [
      {
        value: MessageChannelContactAutoCreationPolicy.SENT_AND_RECEIVED,
        label: 'Sent and Received',
        position: 0,
        color: 'green',
      },
      {
        value: MessageChannelContactAutoCreationPolicy.SENT,
        label: 'Sent',
        position: 1,
        color: 'blue',
      },
      {
        value: MessageChannelContactAutoCreationPolicy.NONE,
        label: 'None',
        position: 2,
        color: 'red',
      },
    ],
    defaultValue: `'${MessageChannelContactAutoCreationPolicy.SENT}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageFolderImportPolicy,
    type: FieldMetadataType.SELECT,
    label: msg`Message folder import policy`,
    description: msg`Message folder import policy`,
    icon: 'IconFolder',
    options: [
      {
        value: MessageFolderImportPolicy.ALL_FOLDERS,
        label: 'All folders',
        position: 0,
        color: 'green',
      },
      {
        value: MessageFolderImportPolicy.SELECTED_FOLDERS,
        label: 'Selected folders',
        position: 1,
        color: 'blue',
      },
    ],
    defaultValue: `'${MessageFolderImportPolicy.ALL_FOLDERS}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  messageFolderImportPolicy: MessageFolderImportPolicy;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeNonProfessionalEmails,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Exclude non professional emails`,
    description: msg`Exclude non professional emails`,
    icon: 'IconBriefcase',
    defaultValue: true,
  })
  @WorkspaceIsFieldUIReadOnly()
  excludeNonProfessionalEmails: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeGroupEmails,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Exclude group emails`,
    description: msg`Exclude group emails`,
    icon: 'IconUsersGroup',
    defaultValue: true,
  })
  @WorkspaceIsFieldUIReadOnly()
  excludeGroupEmails: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.pendingGroupEmailsAction,
    type: FieldMetadataType.SELECT,
    label: msg`Pending group emails action`,
    description: msg`Pending action for group emails`,
    icon: 'IconUsersGroup',
    options: [
      {
        value: MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_DELETION,
        label: 'Group emails deletion',
        position: 0,
        color: 'red',
      },
      {
        value: MessageChannelPendingGroupEmailsAction.GROUP_EMAILS_IMPORT,
        label: 'Group emails import',
        position: 1,
        color: 'green',
      },
      {
        value: MessageChannelPendingGroupEmailsAction.NONE,
        label: 'None',
        position: 2,
        color: 'blue',
      },
    ],
    defaultValue: `'${MessageChannelPendingGroupEmailsAction.NONE}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  pendingGroupEmailsAction: MessageChannelPendingGroupEmailsAction;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: msg`Is Sync Enabled`,
    description: msg`Is Sync Enabled`,
    icon: 'IconRefresh',
    defaultValue: true,
  })
  @WorkspaceIsFieldUIReadOnly()
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: msg`Last sync cursor`,
    description: msg`Last sync cursor`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncCursor: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last sync date`,
    description: msg`Last sync date`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncedAt: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: msg`Sync status`,
    description: msg`Sync status`,
    icon: 'IconStatusChange',
    options: [
      {
        value: MessageChannelSyncStatus.ONGOING,
        label: 'Ongoing',
        position: 1,
        color: 'yellow',
      },
      {
        value: MessageChannelSyncStatus.NOT_SYNCED,
        label: 'Not Synced',
        position: 2,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStatus.ACTIVE,
        label: 'Active',
        position: 3,
        color: 'green',
      },
      {
        value: MessageChannelSyncStatus.FAILED_INSUFFICIENT_PERMISSIONS,
        label: 'Failed Insufficient Permissions',
        position: 4,
        color: 'red',
      },
      {
        value: MessageChannelSyncStatus.FAILED_UNKNOWN,
        label: 'Failed Unknown',
        position: 5,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncStatus: MessageChannelSyncStatus | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStage,
    type: FieldMetadataType.SELECT,
    label: msg`Sync stage`,
    description: msg`Sync stage`,
    icon: 'IconStatusChange',
    options: [
      {
        value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_PENDING,
        label: 'Messages list fetch pending',
        position: 0,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_SCHEDULED,
        label: 'Messages list fetch scheduled',
        position: 1,
        color: 'green',
      },
      {
        value: MessageChannelSyncStage.MESSAGE_LIST_FETCH_ONGOING,
        label: 'Messages list fetch ongoing',
        position: 2,
        color: 'orange',
      },
      {
        value: MessageChannelSyncStage.MESSAGES_IMPORT_PENDING,
        label: 'Messages import pending',
        position: 3,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStage.MESSAGES_IMPORT_SCHEDULED,
        label: 'Messages import scheduled',
        position: 4,
        color: 'green',
      },
      {
        value: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
        label: 'Messages import ongoing',
        position: 5,
        color: 'orange',
      },
      {
        value: MessageChannelSyncStage.FAILED,
        label: 'Failed',
        position: 6,
        color: 'red',
      },
      {
        value: MessageChannelSyncStage.PENDING_CONFIGURATION,
        label: 'Pending configuration',
        position: 7,
        color: 'gray',
      },
    ],
    defaultValue: `'${MessageChannelSyncStage.PENDING_CONFIGURATION}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  syncStage: MessageChannelSyncStage;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Sync stage started at`,
    description: msg`Sync stage started at`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  syncStageStartedAt: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: msg`Throttle Failure Count`,
    description: msg`Throttle Failure Count`,
    icon: 'IconX',
    defaultValue: 0,
  })
  @WorkspaceIsFieldUIReadOnly()
  throttleFailureCount: number;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationType.MANY_TO_ONE,
    label: msg`Connected Account`,
    description: msg`Connected Account`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'messageChannels',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceJoinColumn('connectedAccount')
  connectedAccountId: string;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: RelationType.ONE_TO_MANY,
    label: msg`Message Channel Association`,
    description: msg`Messages from the channel.`,
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelMessageAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageFolders,
    type: RelationType.ONE_TO_MANY,
    label: msg`Message Folders`,
    description: msg`Message Folders`,
    icon: 'IconFolder',
    inverseSideTarget: () => MessageFolderWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  messageFolders: Relation<MessageFolderWorkspaceEntity[]>;
}
