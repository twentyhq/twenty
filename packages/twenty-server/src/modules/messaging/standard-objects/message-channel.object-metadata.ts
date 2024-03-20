import { FieldMetadataType } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { messageChannelStandardFieldIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/field-metadata.decorator';
import { IsNullable } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-nullable.decorator';
import { IsSystem } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects/base.object-metadata';
import { ConnectedAccountObjectMetadata } from 'src/modules/connected-account/standard-objects/connected-account.object-metadata';
import { MessageChannelMessageAssociationObjectMetadata } from 'src/modules/messaging/standard-objects/message-channel-message-association.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.messageChannel,
  namePlural: 'messageChannels',
  labelSingular: 'Message Channel',
  labelPlural: 'Message Channels',
  description: 'Message Channels',
  icon: 'IconMessage',
})
@IsSystem()
export class MessageChannelObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: messageChannelStandardFieldIds.visibility,
    type: FieldMetadataType.SELECT,
    label: 'Visibility',
    description: 'Visibility',
    icon: 'IconEyeglass',
    options: [
      { value: 'metadata', label: 'Metadata', position: 0, color: 'green' },
      { value: 'subject', label: 'Subject', position: 1, color: 'blue' },
      {
        value: 'share_everything',
        label: 'Share Everything',
        position: 2,
        color: 'orange',
      },
    ],
    defaultValue: { value: "'share_everything'" },
  })
  visibility: string;

  @FieldMetadata({
    standardId: messageChannelStandardFieldIds.handle,
    type: FieldMetadataType.TEXT,
    label: 'Handle',
    description: 'Handle',
    icon: 'IconAt',
  })
  handle: string;

  @FieldMetadata({
    standardId: messageChannelStandardFieldIds.connectedAccount,
    type: FieldMetadataType.RELATION,
    label: 'Connected Account',
    description: 'Connected Account',
    icon: 'IconUserCircle',
    joinColumn: 'connectedAccountId',
  })
  connectedAccount: ConnectedAccountObjectMetadata;

  @FieldMetadata({
    standardId: messageChannelStandardFieldIds.type,
    type: FieldMetadataType.SELECT,
    label: 'Type',
    description: 'Channel Type',
    icon: 'IconMessage',
    options: [
      { value: 'email', label: 'Email', position: 0, color: 'green' },
      { value: 'sms', label: 'SMS', position: 1, color: 'blue' },
    ],
    defaultValue: { value: "'email'" },
  })
  type: string;

  @FieldMetadata({
    standardId: messageChannelStandardFieldIds.isContactAutoCreationEnabled,
    type: FieldMetadataType.BOOLEAN,
    label: 'Is Contact Auto Creation Enabled',
    description: 'Is Contact Auto Creation Enabled',
    icon: 'IconUserCircle',
    defaultValue: { value: true },
  })
  isContactAutoCreationEnabled: boolean;

  @FieldMetadata({
    standardId:
      messageChannelStandardFieldIds.messageChannelMessageAssociations,
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
  messageChannelMessageAssociations: MessageChannelMessageAssociationObjectMetadata[];
}
