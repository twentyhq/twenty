import { msg } from '@lingui/core/macro';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import {
  ConnectedAccountProvider,
  FieldMetadataType,
  RelationOnDeleteAction,
} from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';
import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { WorkspaceEntity } from 'src/engine/twenty-orm/decorators/workspace-entity.decorator';
import { WorkspaceField } from 'src/engine/twenty-orm/decorators/workspace-field.decorator';
import { WorkspaceIsFieldUIReadOnly } from 'src/engine/twenty-orm/decorators/workspace-is-field-ui-readonly.decorator';
import { WorkspaceIsNullable } from 'src/engine/twenty-orm/decorators/workspace-is-nullable.decorator';
import { WorkspaceIsSystem } from 'src/engine/twenty-orm/decorators/workspace-is-system.decorator';
import { WorkspaceJoinColumn } from 'src/engine/twenty-orm/decorators/workspace-join-column.decorator';
import { WorkspaceRelation } from 'src/engine/twenty-orm/decorators/workspace-relation.decorator';
import { CONNECTED_ACCOUNT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_ICONS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-icons';
import { CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@WorkspaceEntity({
  standardId: STANDARD_OBJECT_IDS.connectedAccount,

  namePlural: 'connectedAccounts',
  labelSingular: msg`Connected Account`,
  labelPlural: msg`Connected Accounts`,
  description: msg`A connected account`,
  icon: STANDARD_OBJECT_ICONS.connectedAccount,
  labelIdentifierStandardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
})
@WorkspaceIsSystem()
export class ConnectedAccountWorkspaceEntity extends BaseWorkspaceEntity {
  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handle,
    type: FieldMetadataType.TEXT,
    label: msg`handle`,
    description: msg`The account handle (email, username, phone number, etc.)`,
    icon: 'IconMail',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  handle: string | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.provider,
    type: FieldMetadataType.TEXT,
    label: msg`provider`,
    description: msg`The account provider`,
    icon: 'IconSettings',
    defaultValue: `'${ConnectedAccountProvider.GOOGLE}'`,
  })
  @WorkspaceIsFieldUIReadOnly()
  provider: ConnectedAccountProvider; // field metadata should be a SELECT

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accessToken,
    type: FieldMetadataType.TEXT,
    label: msg`Access Token`,
    description: msg`Messaging provider access token`,
    icon: 'IconKey',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  accessToken: string | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.refreshToken,
    type: FieldMetadataType.TEXT,
    label: msg`Refresh Token`,
    description: msg`Messaging provider refresh token`,
    icon: 'IconKey',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  refreshToken: string | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastCredentialsRefreshedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Last credentials refreshed at`,
    description: msg`Last credentials refreshed at`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  lastCredentialsRefreshedAt: Date | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.lastSyncHistoryId,
    type: FieldMetadataType.TEXT,
    label: msg`Last sync history ID`,
    description: msg`Last sync history ID`,
    icon: 'IconHistory',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  lastSyncHistoryId: string | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.authFailedAt,
    type: FieldMetadataType.DATE_TIME,
    label: msg`Auth failed at`,
    description: msg`Auth failed at`,
    icon: 'IconX',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  authFailedAt: Date | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.handleAliases,
    type: FieldMetadataType.TEXT,
    label: msg`Handle Aliases`,
    description: msg`Handle Aliases`,
    icon: 'IconMail',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  handleAliases: string | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.scopes,
    type: FieldMetadataType.ARRAY,
    label: msg`Scopes`,
    description: msg`Scopes`,
    icon: 'IconSettings',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  scopes: string[] | null;

  @WorkspaceField({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.connectionParameters,
    type: FieldMetadataType.RAW_JSON,
    label: msg`Custom Connection Parameters`,
    description: msg`JSON object containing custom connection parameters`,
    icon: 'IconSettings',
  })
  @WorkspaceIsFieldUIReadOnly()
  @WorkspaceIsNullable()
  connectionParameters: ImapSmtpCaldavParams | null;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.accountOwner,
    type: RelationType.MANY_TO_ONE,
    label: msg`Account Owner`,
    description: msg`Account Owner`,
    icon: 'IconUserCircle',
    inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
    inverseSideFieldKey: 'connectedAccounts',
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  accountOwner: Relation<WorkspaceMemberWorkspaceEntity>;

  @WorkspaceJoinColumn('accountOwner')
  accountOwnerId: string;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.messageChannels,
    type: RelationType.ONE_TO_MANY,
    label: msg`Message Channels`,
    description: msg`Message Channels`,
    icon: 'IconMessage',
    inverseSideTarget: () => MessageChannelWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  messageChannels: Relation<MessageChannelWorkspaceEntity[]>;

  @WorkspaceRelation({
    standardId: CONNECTED_ACCOUNT_STANDARD_FIELD_IDS.calendarChannels,
    type: RelationType.ONE_TO_MANY,
    label: msg`Calendar Channels`,
    description: msg`Calendar Channels`,
    icon: 'IconCalendar',
    inverseSideTarget: () => CalendarChannelWorkspaceEntity,
    onDelete: RelationOnDeleteAction.CASCADE,
  })
  @WorkspaceIsFieldUIReadOnly()
  calendarChannels: Relation<CalendarChannelWorkspaceEntity[]>;
}
