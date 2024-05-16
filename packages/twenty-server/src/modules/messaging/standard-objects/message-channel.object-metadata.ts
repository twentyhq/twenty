import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { MESSAGE_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-object.decorator';
import { WorkspaceIsNotAuditLogged } from 'src/engine/twenty-orm/decorators/workspace-is-not-audit-logged.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';

export enum MessageChannelSyncStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export enum MessageChannelVisibility {
  METADATA = 'metadata',
  SUBJECT = 'subject',
  SHARE_EVERYTHING = 'share_everything',
}

export enum MessageChannelType {
  EMAIL = 'email',
  SMS = 'sms',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.messageChannel,
  namePlural: 'messageChannels',
  labelSingular: 'Message Channel',
  labelPlural: 'Message Channels',
  description: 'Message Channels',
  icon: 'IconMessage',
})
@WorkspaceIsNotAuditLogged()
@WorkspaceIsSystem()
export class MessageChannelObjectMetadata extends BaseWorkspaceEntity {
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
  syncedAt: string;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncStatus,
    type: FieldMetadataType.SELECT,
    label: 'Last sync status',
    description: 'Last sync status',
    icon: 'IconHistory',
    options: [
      {
        value: MessageChannelSyncStatus.PENDING,
        label: 'Pending',
        position: 0,
        color: 'blue',
      },
      {
        value: MessageChannelSyncStatus.ONGOING,
        label: 'Ongoing',
        position: 1,
        color: 'yellow',
      },
      {
        value: MessageChannelSyncStatus.SUCCEEDED,
        label: 'Succeeded',
        position: 2,
        color: 'green',
      },
      {
        value: MessageChannelSyncStatus.FAILED,
        label: 'Failed',
        position: 3,
        color: 'red',
      },
    ],
  })
  @WorkspaceIsNullable()
  syncStatus: MessageChannelSyncStatus;

  @WorkspaceField({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.ongoingSyncStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Ongoing sync started at',
    description: 'Ongoing sync started at',
    icon: 'IconHistory',
  })
  @WorkspaceIsNullable()
  ongoingSyncStartedAt: string;

  @WorkspaceRelation({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
    inverseSideTarget: () => ConnectedAccountObjectMetadata,
    inverseSideFieldKey: 'messageChannels',
  })
  connectedAccount: Relation<ConnectedAccountObjectMetadata>;

  @WorkspaceRelation({
    standardId:
      MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Channel Association',
    description: 'Messages from the channel.',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelMessageAssociationObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationObjectMetadata[]
  >;
}
