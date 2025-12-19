import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class ImapSmtpCalDavAPIService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly createMessageChannelService: CreateMessageChannelService,
    private readonly createCalendarChannelService: CreateCalendarChannelService,
  ) {}

  async getImapSmtpCaldavConnectedAccount(
    workspaceId: string,
    id: string,
  ): Promise<ConnectedAccountWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        return connectedAccountRepository.findOne({
          where: { id, provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV },
        });
      },
    );
  }

  async processAccount(input: {
    handle: string;
    workspaceMemberId: string;
    workspaceId: string;
    connectionParameters: EmailAccountConnectionParameters;
    connectedAccountId?: string;
  }): Promise<string> {
    const { handle, workspaceId, workspaceMemberId, connectedAccountId } =
      input;

    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const connectedAccountRepository =
          await this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
            workspaceId,
            'connectedAccount',
          );

        const messageChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
            workspaceId,
            'messageChannel',
          );

        const calendarChannelRepository =
          await this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
            workspaceId,
            'calendarChannel',
          );

        const existingAccount = connectedAccountId
          ? await connectedAccountRepository.findOne({
              where: { id: connectedAccountId },
            })
          : await connectedAccountRepository.findOne({
              where: { handle, accountOwnerId: workspaceMemberId },
            });

        const newOrExistingAccountId =
          existingAccount?.id ?? connectedAccountId ?? v4();

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        const existingMessageChannel = existingAccount
          ? await messageChannelRepository.findOne({
              where: { connectedAccountId: existingAccount.id },
            })
          : null;

        const existingCalendarChannel = existingAccount
          ? await calendarChannelRepository.findOne({
              where: { connectedAccountId: existingAccount.id },
            })
          : null;

        const shouldCreateMessageChannel =
          !isDefined(existingMessageChannel) &&
          Boolean(input.connectionParameters.IMAP);

        const shouldCreateCalendarChannel =
          !isDefined(existingCalendarChannel) &&
          Boolean(input.connectionParameters.CALDAV);

        await workspaceDataSource.transaction(
          async (manager: WorkspaceEntityManager) => {
            await connectedAccountRepository.save(
              {
                id: newOrExistingAccountId,
                handle,
                provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
                connectionParameters: input.connectionParameters,
                accountOwnerId: workspaceMemberId,
              },
              {},
              manager,
            );

            if (shouldCreateMessageChannel) {
              await this.createMessageChannelService.createMessageChannel({
                workspaceId,
                connectedAccountId: newOrExistingAccountId,
                handle,
                manager,
              });
            }

            if (shouldCreateCalendarChannel) {
              await this.createCalendarChannelService.createCalendarChannel({
                workspaceId,
                connectedAccountId: newOrExistingAccountId,
                handle,
                manager,
              });
            }
          },
        );

        return newOrExistingAccountId;
      },
    );
  }
}
