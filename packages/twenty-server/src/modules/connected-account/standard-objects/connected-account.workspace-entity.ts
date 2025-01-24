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
import { CONNECTED_ACCOUNT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export enum ConnectedAccountProvider {
  GOOGLE = 'google',
  MICROSOFT = 'microsoft',
}

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.connectedAccount,
  namePlural: 'connectedAccounts',
  labelSingular: 'Connected Account',
  labelPlural: 'Connected Accounts',
  description: 'A connected account',
  icon: STANDARD_OBJECT_ICONS.connectedAccount,
  labelIdentifierStandardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
@WorkspaceIsNotAuditLogged()
export class ConnectedAccountWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: 'handle',
    description: 'The account handle (email, username, phone number, etc.)',
    icon: 'IconMail',
  })
  handle: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.provider,
    type: FieldMetadataType.TEXT,
    label: 'provider',
    description: 'The account provider',
    icon: 'IconSettings',
  })
  provider: ConnectedAccountProvider; // field metadata should be a SELECT

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accessToken,
    type: FieldMetadataType.TEXT,
    label: 'Access Token',
    description: 'Messaging provider access token',
    icon: 'IconKey',
  })
  accessToken: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.refreshToken,
    type: FieldMetadataType.TEXT,
    label: 'Refresh Token',
    description: 'Messaging provider refresh token',
    icon: 'IconKey',
  })
  refreshToken: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastSyncHistoryId,
    type: FieldMetadataType.TEXT,
    label: 'Last sync history ID',
    description: 'Last sync history ID',
    icon: 'IconHistory',
  })
  lastSyncHistoryId: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.authFailedAt,
    type: FieldMetadataType.DATE_TIME,
    label: 'Auth failed at',
    description: 'Auth failed at',
    icon: 'IconX',
  })
  @WorkspaceIsNullable()
  authFailedAt: Date | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handleAliases,
    type: FieldMetadataType.TEXT,
    label: 'Handle Aliases',
    description: 'Handle Aliases',
    icon: 'IconMail',
  })
  handleAliases: string;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.scopes,
    type: FieldMetadataType.ARRAY,
    label: 'Scopes',
    description: 'Scopes',
    icon: 'IconSettings',
  })
  @WorkspaceIsNullable()
  scopes: string[] | null;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accountOwner,
    type: RelationMetadataType.MANY_TO_ONE,
    label: 'Account Owner',
    description: 'Account Owner',
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'connectedAccounts',
  })
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.messageChannels,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Message Channels',
    description: 'Message Channels',
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  messageChannels: Relation<MessageChannelWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.calendarChannels,
    type: RelationMetadataType.ONE_TO_MANY,
    label: 'Calendar Channels',
    description: 'Calendar Channels',
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  calendarChannels: Relation<CalendarChannelWorkspaceEntity[]>;
}
