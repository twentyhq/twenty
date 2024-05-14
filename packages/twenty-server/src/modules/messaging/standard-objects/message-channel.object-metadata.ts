import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { MESSAGE_CHANNEL_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';
import { IsNotAuditLogged } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-not-audit-logged.decorator';

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

@ObjectMetadata({
  standardId: STANDARD_OBJECT_IDS.messageChannel,
  namePlural: 'messageChannels',
  labelSingular: 'Message Channel',
  labelPlural: 'Message Channels',
  description: 'Message Channels',
  icon: 'IconMessage',
})
@IsNotAuditLogged()
@IsSystem()
export class MessageChannelObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
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

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.connectedAccount,
    type: FieldMetadataType.RELATION,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
  })
  connectedAccount: Relation<ConnectedAccountObjectMetadata>;

  @FieldMetadata({
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

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Contact Auto Creation Enabled',
    description: 'Is Contact Auto Creation Enabled',
    icon: 'IconUserCircle',
    defaultValue: true,
  })
  isContactAutoCreationEnabled: boolean;

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.isSyncEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Sync Enabled',
    description: 'Is Sync Enabled',
    icon: 'IconRefresh',
    defaultValue: true,
  })
  isSyncEnabled: boolean;

  @FieldMetadata({
    standardId:
      MESSAGE_CHANNEL_STANDARD_FIELD_IDS.messageChannelMessageAssociations,
    type: FieldMetadataType.RELATION,
    label: 'Message Channel Association',
    description: 'Messages from the channel.',
    icon: 'IconMessage',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => MessageChannelMessageAssociationObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @IsNullable()
  messageChannelMessageAssociations: Relation<
    MessageChannelMessageAssociationObjectMetadata[]
  >;

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncCursor,
    type: FieldMetadataType.TEXT,
    label: 'Last sync cursor',
    description: 'Last sync cursor',
    icon: 'IconHistory',
  })
  syncCursor: string;

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.syncedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Last sync date',
    description: 'Last sync date',
    icon: 'IconHistory',
  })
  @IsNullable()
  syncedAt: string;

  @FieldMetadata({
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
  @IsNullable()
  syncStatus: MessageChannelSyncStatus;

  @FieldMetadata({
    standardId: MESSAGE_CHANNEL_STANDARD_FIELD_IDS.ongoingSyncStartedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Ongoing sync started at',
    description: 'Ongoing sync started at',
    icon: 'IconHistory',
  })
  @IsNullable()
  ongoingSyncStartedAt: string;
}
