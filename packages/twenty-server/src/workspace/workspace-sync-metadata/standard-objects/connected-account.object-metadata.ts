import { FeatureFlagKeys } from 'src/core/feature-flag/feature-flag.entity';
import { FieldMetadataType } from 'src/metadata/field-metadata/field-metadata.entity';
import {
  RelationMetadataType,
  RelationOnDeleteAction,
} from 'src/metadata/relation-metadata/relation-metadata.entity';
import { connectedAccountStandardFieldIds } from 'src/workspace/workspace-sync-metadata/constants/standard-field-ids';
import { standardObjectIds } from 'src/workspace/workspace-sync-metadata/constants/standard-object-ids';
import { FieldMetadata } from 'src/workspace/workspace-sync-metadata/decorators/field-metadata.decorator';
import { Gate } from 'src/workspace/workspace-sync-metadata/decorators/gate.decorator';
import { IsSystem } from 'src/workspace/workspace-sync-metadata/decorators/is-system.decorator';
import { ObjectMetadata } from 'src/workspace/workspace-sync-metadata/decorators/object-metadata.decorator';
import { RelationMetadata } from 'src/workspace/workspace-sync-metadata/decorators/relation-metadata.decorator';
import { BaseObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/base.object-metadata';
import { CalendarChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/calendar-channel.object-metadata';
import { MessageChannelObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/message-channel.object-metadata';
import { WorkspaceMemberObjectMetadata } from 'src/workspace/workspace-sync-metadata/standard-objects/workspace-member.object-metadata';

@ObjectMetadata({
  standardId: standardObjectIds.connectedAccount,
  namePlural: 'connectedAccounts',
  labelSingular: 'Connected Account',
  labelPlural: 'Connected Accounts',
  description: 'A connected account',
  icon: 'IconAt',
})
@IsSystem()
export class ConnectedAccountObjectMetadata extends BaseObjectMetadata {
  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.handle,
    type: FieldMetadataType.TEXT,
    label: 'handle',
    description: 'The account handle (email, username, phone number, etc.)',
    icon: 'IconMail',
  })
  handle: string;

  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.provider,
    type: FieldMetadataType.TEXT,
    label: 'provider',
    description: 'The account provider',
    icon: 'IconSettings',
  })
  provider: string;

  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.accessToken,
    type: FieldMetadataType.TEXT,
    label: 'Access Token',
    description: 'Messaging provider access token',
    icon: 'IconKey',
  })
  accessToken: string;

  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.refreshToken,
    type: FieldMetadataType.TEXT,
    label: 'Refresh Token',
    description: 'Messaging provider refresh token',
    icon: 'IconKey',
  })
  refreshToken: string;

  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.accountOwner,
    type: FieldMetadataType.RELATION,
    label: 'Account Owner',
    description: 'Account Owner',
    icon: 'IconUserCircle',
    joinColumn: 'accountOwnerId',
  })
  accountOwner: WorkspaceMemberObjectMetadata;

  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.lastSyncHistoryId,
    type: FieldMetadataType.TEXT,
    label: 'Last sync history ID',
    description: 'Last sync history ID',
    icon: 'IconHistory',
  })
  lastSyncHistoryId: string;

  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.messageChannels,
    type: FieldMetadataType.RELATION,
    label: 'Message Channel',
    description: 'Message Channel',
    icon: 'IconMessage',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => MessageChannelObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  messageChannels: MessageChannelObjectMetadata[];

  @FieldMetadata({
    standardId: connectedAccountStandardFieldIds.calendarChannels,
    type: FieldMetadataType.RELATION,
    label: 'Calendar Channel',
    description: 'Calendar Channel',
    icon: 'IconCalendar',
  })
  @RelationMetadata({
    type: RelationMetadataType.ONE_TO_MANY,
    inverseSideTarget: () => CalendarChannelObjectMetadata,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @Gate({
    featureFlag: FeatureFlagKeys.IsCalendarEnabled,
  })
  calendarChannels: CalendarChannelObjectMetadata[];
}
