import { type ConnectedAccountProvider } from 'twenty-shared/types';

import { type ImapSmtpCaldavParams } from 'src/engine/core-modules/imap-smtp-caldav-connection/types/imap-smtp-caldav-connection.type';
import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { type EntityRelation } from 'src/engine/workspace-manager/workspace-migration/types/entity-relation.interface';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

export class ConnectedAccountWorkspaceEntity extends BaseWorkspaceEntity {
  handle: string | null;
  provider: ConnectedAccountProvider;
  accessToken: string | null;
  refreshToken: string | null;
  lastCredentialsRefreshedAt: Date | null;
  lastSyncHistoryId: string | null;
  authFailedAt: Date | null;
  handleAliases: string | null;
  scopes: string[] | null;
  connectionParameters: ImapSmtpCaldavParams | null;
  accountOwner: EntityRelation<WorkspaceMemberWorkspaceEntity>;
  accountOwnerId: string;
  messageChannels: EntityRelation<MessageChannelWorkspaceEntity[]>;
  calendarChannels: EntityRelation<CalendarChannelWorkspaceEntity[]>;
}
