import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';

@Injectable()
export class ConnectedAccountMetadataService {
  private readonly logger = new Logger(ConnectedAccountMetadataService.name);

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly repository: Repository<ConnectedAccountEntity>,
    @InjectRepository(CalendarChannelEntity)
    private readonly calendarChannelRepository: Repository<CalendarChannelEntity>,
    @InjectRepository(MessageChannelEntity)
    private readonly messageChannelRepository: Repository<MessageChannelEntity>,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly appOAuthRevokeService: AppOAuthRevokeService,
  ) {}

  async findByUserWorkspaceId({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity[]> {
    return this.repository.find({
      where: { userWorkspaceId, workspaceId },
    });
  }

  async findById({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity | null> {
    return this.repository.findOne({ where: { id, workspaceId } });
  }

  async findByIdAndUserWorkspaceId({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity | null> {
    return this.repository.findOne({
      where: { id, userWorkspaceId, workspaceId },
    });
  }

  async verifyOwnership({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity> {
    const connectedAccount = await this.repository.findOne({
      where: { id, workspaceId },
    });

    if (!connectedAccount) {
      throw new ConnectedAccountException(
        `Connected account ${id} not found`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_NOT_FOUND,
      );
    }

    if (connectedAccount.userWorkspaceId !== userWorkspaceId) {
      throw new ConnectedAccountException(
        `Connected account ${id} does not belong to user workspace ${userWorkspaceId}`,
        ConnectedAccountExceptionCode.CONNECTED_ACCOUNT_OWNERSHIP_VIOLATION,
      );
    }

    return connectedAccount;
  }

  async getUserConnectedAccountIds({
    userWorkspaceId,
    workspaceId,
  }: {
    userWorkspaceId: string;
    workspaceId: string;
  }): Promise<string[]> {
    const accounts = await this.repository.find({
      where: { userWorkspaceId, workspaceId },
      select: ['id'],
    });

    return accounts.map((account) => account.id);
  }

  async create(
    data: Partial<ConnectedAccountEntity> & {
      workspaceId: string;
      handle: string;
      provider: string;
      userWorkspaceId: string;
    },
  ): Promise<ConnectedAccountEntity> {
    const entity = this.repository.create(data);

    return this.repository.save(entity);
  }

  async update({
    id,
    workspaceId,
    data,
  }: {
    id: string;
    workspaceId: string;
    data: Partial<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountEntity> {
    await this.repository.update(
      { id, workspaceId },
      data as Record<string, unknown>,
    );

    return this.repository.findOneOrFail({ where: { id, workspaceId } });
  }

  async delete({
    id,
    workspaceId,
  }: {
    id: string;
    workspaceId: string;
  }): Promise<ConnectedAccountEntity> {
    const connectedAccount = await this.repository.findOneOrFail({
      where: { id, workspaceId },
    });

    const authContext = buildSystemAuthContext(workspaceId);

    const [messageChannels, calendarChannels] = await Promise.all([
      this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.messageChannelRepository.find({
            where: { connectedAccountId: id, workspaceId },
          }),
        authContext,
      ),
      this.globalWorkspaceOrmManager.executeInWorkspaceContext(
        async () =>
          this.calendarChannelRepository.find({
            where: { connectedAccountId: id, workspaceId },
          }),
        authContext,
      ),
    ]);

    this.logger.log(
      `WorkspaceId: ${workspaceId} Deleting connected account ${id} with ${messageChannels.length} message channel(s) and ${calendarChannels.length} calendar channel(s)`,
    );

    // Best-effort revocation against the provider's revokeEndpoint (no-op
    // for non-app providers and for app providers without a revokeEndpoint
    // declared). We don't want a slow or failing provider to block the
    // local disconnect, so any error is swallowed inside the service.
    await this.appOAuthRevokeService.revokeIfApp(connectedAccount);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      await this.repository.delete({
        id,
        workspaceId,
      });
    }, authContext);

    return connectedAccount;
  }
}
