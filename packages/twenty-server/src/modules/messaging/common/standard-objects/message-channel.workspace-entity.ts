import { registerEnumType } from '@nestjs/graphql';

import { FieldMetadataType } from 'twenty-shared';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { MESSAGE_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { MessageChannelMessageAssociationWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel-message-association.workspace-entity';

export enum MessageChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum MessageChannelSyncStage {
  FULL_MESSAGE_LIST_FETCH_PENDING = 'FULL_MESSAGE_LIST_FETCH_PENDING',
  PARTIAL_MESSAGE_LIST_FETCH_PENDING = 'PARTIAL_MESSAGE_LIST_FETCH_PENDING',
  MESSAGE_LIST_FETCH_ONGOING = 'MESSAGE_LIST_FETCH_ONGOING',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum MessageChannelVisibility {
  METADATA = 'METADATA',
  SUBJECT = 'SUBJECT',
  SHARE_EVERYTHING = 'SHARE_EVERYTHING',
}

export enum MessageChannelType {
  EMAIL = 'email',
  SMS = 'sms',
}

export enum MessageChannelContactAutoCreationPolicy {
  SENT_AND_RECEIVED = 'SENT_AND_RECEIVED',
  SENT = 'SENT',
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

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageChannel,
  namePlural: 'messageChannels',
  labelSingular: 'Message Channel',
  labelPlural: 'Message Channels',
  description: 'Message Channels',
  icon: STANDARD_OBJECT_ICONS.messageChannel,
  labelIdentifierStandardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageChannelWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.visibility,
    type: FieldMetadataType.SELECT,
    label: 'Visibility',
    description: 'Visibility',
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
  visibility: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.type,
    type: FieldMetadataType.SELECT,
    label: 'Type',
    description: 'Channel Type',
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
  type: string;

  // TODO: Deprecate this field and migrate data to contactAutoCreationFor
  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Contact Auto Creation Enabled',
    description: 'Is Contact Auto Creation Enabled',
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  isContactAutoCreationEnabled: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.contactAutoCreationPolicy,
    type: FieldMetadataType.SELECT,
    label: 'Contact auto creation policy',
    description:
      'Automatically create People records when receiving or sending emails',
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
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeNonProfessionalEmails,
    type: FieldMetadataType.BOOLEAN,
    label: 'Exclude non professional emails',
    description: 'Exclude non professional emails',
    icon: 'IconBriefcase',
    defaultValue: true,
  })
  excludeNonProfessionalEmails: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.excludeGroupEmails,
    type: FieldMetadataType.BOOLEAN,
    label: 'Exclude group emails',
    description: 'Exclude group emails',
    icon: 'IconUsersGroup',
    defaultValue: true,
  })
  excludeGroupEmails: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Sync Enabled',
    description: 'Is Sync Enabled',
    icon: 'IconRefresh',
    defaultValue: true,
  })
  isSyncEnabled: boolean;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: 'Last sync cursor',
    description: 'Last sync cursor',
    icon: 'IconHistory',
  })
  syncCursor: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Last sync date',
    description: 'Last sync date',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncedAt: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: 'Sync status',
    description: 'Sync status',
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
  @WorkspaceIsNullable()
  syncStatus: MessageChannelSyncStatus | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStage,
    type: FieldMetadataType.SELECT,
    label: 'Sync stage',
    description: 'Sync stage',
    icon: 'IconStatusChange',
    options: [
      {
        value: MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING,
        label: 'Full messages list fetch pending',
        position: 0,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStage.PARTIAL_MESSAGE_LIST_FETCH_PENDING,
        label: 'Partial messages list fetch pending',
        position: 1,
        color: 'blue',
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
        value: MessageChannelSyncStage.MESSAGES_IMPORT_ONGOING,
        label: 'Messages import ongoing',
        position: 4,
        color: 'orange',
      },
      {
        value: MessageChannelSyncStage.FAILED,
        label: 'Failed',
        position: 5,
        color: 'red',
      },
    ],
    defaultValue: `'${MessageChannelSyncStage.FULL_MESSAGE_LIST_FETCH_PENDING}'`,
  })
  syncStage: MessageChannelSyncStage;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStageStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Sync stage started at',
    description: 'Sync stage started at',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  syncStageStartedAt: string | null;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.throttleFailureCount,
    type: FieldMetadataType.NUMBER,
    label: 'Throttle Failure Count',
    description: 'Throttle Failure Count',
    icon: 'IconX',
    defaultValue: 0,
  })
  throttleFailureCount: number;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    inverseSideTarget: () => ConnectedAccountWorkspaceEntity,
    inverseSideFieldKey: 'messageChannels',
  })
  connectedAccount: Relation<ConnectedAccountWorkspaceEntity>;

  @WorkspaceJoinColumn('connectedAccount')
  connectedAccountId: string;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Channel Association',
    description: 'Messages from the channel.',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelMessageAssociationWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationWorkspaceEntity[]
  >;
}
