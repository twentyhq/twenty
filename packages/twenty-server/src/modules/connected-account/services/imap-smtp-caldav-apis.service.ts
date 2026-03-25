import { Injectable } from '@nestjs/common';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { MessageChannelDataAccessService } from 'src/engine/metadata-modules/message-channel/data-access/services/message-channel-data-access.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';

@Injectable()
export class ImapSmtpCalDavAPIService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly calendarChannelDataAccessService: CalendarChannelDataAccessService,
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
    private readonly messageChannelDataAccessService: MessageChannelDataAccessService,
    private readonly createMessageChannelService: CreateMessageChannelService,
    private readonly createCalendarChannelService: CreateCalendarChannelService,
  ) {}

  async getImapSmtpCaldavConnectedAccount(
    workspaceId: string,
    id: string,
  ): Promise<ConnectedAccountWorkspaceEntity | null> {
    const authContext = buildSystemAuthContext(workspaceId);

    return this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      async () => {
        const connectedAccount =
          await this.connectedAccountDataAccessService.findOne(workspaceId, {
            where: { id, provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV },
          });

        return connectedAccount as ConnectedAccountWorkspaceEntity | null;
      },
      authContext,
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
      async () => {
        const existingAccount = connectedAccountId
          ? await this.connectedAccountDataAccessService.findOne(workspaceId, {
              where: { id: connectedAccountId },
            })
          : await this.connectedAccountDataAccessService.findOne(workspaceId, {
              where: { handle, accountOwnerId: workspaceMemberId },
            });

        const newOrExistingAccountId =
          existingAccount?.id ?? connectedAccountId ?? v4();

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        const existingMessageChannel = existingAccount
          ? await this.messageChannelDataAccessService.findOne(workspaceId, {
              where: { connectedAccountId: existingAccount.id },
            })
          : null;

        const existingCalendarChannel = existingAccount
          ? await this.calendarChannelDataAccessService.findOne(workspaceId, {
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
            await this.connectedAccountDataAccessService.save(
              workspaceId,
              {
                id: newOrExistingAccountId,
                handle,
                provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
                connectionParameters: input.connectionParameters,
                accountOwnerId: workspaceMemberId,
              },
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
      authContext,
    );
  }
}
