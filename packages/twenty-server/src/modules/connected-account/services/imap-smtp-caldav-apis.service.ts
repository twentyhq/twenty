import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConnectedAccountProvider } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { Repository } from 'typeorm';

import { CreateCalendarChannelService } from 'src/engine/core-modules/auth/services/create-calendar-channel.service';
import { CreateMessageChannelService } from 'src/engine/core-modules/auth/services/create-message-channel.service';
import { type EmailAccountConnectionParameters } from 'src/engine/core-modules/imap-smtp-caldav-connection/dtos/imap-smtp-caldav-connection.dto';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ImapSmtpCalDavAPIService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
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
        const connectedAccount = await this.connectedAccountRepository.findOne({
          where: {
            id,
            provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
            workspaceId,
          },
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
        // Resolve userWorkspaceId from workspaceMemberId
        const workspaceMemberRepo =
          await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
            workspaceId,
            'workspaceMember',
          );

        const member = await workspaceMemberRepo.findOne({
          where: { id: workspaceMemberId },
        });

        const userWorkspaceId = member
          ? ((
              await this.userWorkspaceRepository.findOne({
                where: { userId: member.userId, workspaceId },
              })
            )?.id ?? null)
          : null;

        const existingAccount = connectedAccountId
          ? await this.connectedAccountRepository.findOne({
              where: { id: connectedAccountId, workspaceId },
            })
          : await this.connectedAccountRepository.findOne({
              where: {
                handle,
                userWorkspaceId:
                  userWorkspaceId ?? '00000000-0000-0000-0000-000000000000',
                workspaceId,
              },
            });

        const newOrExistingAccountId =
          existingAccount?.id ?? connectedAccountId ?? v4();

        const workspaceDataSource =
          await this.globalWorkspaceOrmManager.getGlobalWorkspaceDataSource();

        const existingMessageChannel = existingAccount
          ? await this.messageChannelRepository.findOne({
              where: { connectedAccountId: existingAccount.id, workspaceId },
            })
          : null;

        const existingCalendarChannel = existingAccount
          ? await this.calendarChannelRepository.findOne({
              where: { connectedAccountId: existingAccount.id, workspaceId },
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
            await this.connectedAccountRepository.save({
              id: newOrExistingAccountId,
              handle,
              provider: ConnectedAccountProvider.IMAP_SMTP_CALDAV,
              connectionParameters: input.connectionParameters,
              userWorkspaceId,
              workspaceId,
            } as ConnectedAccountEntity);

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
