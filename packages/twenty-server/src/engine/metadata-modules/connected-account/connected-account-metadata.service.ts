import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  type FindOptionsRelations,
  type FindOptionsWhere,
  Repository,
} from 'typeorm';

import { isDefined } from 'twenty-shared/utils';

import { AppOAuthRevokeService } from 'src/engine/core-modules/application/connection-provider/refresh/services/app-oauth-revoke.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import {
  ConnectedAccountException,
  ConnectedAccountExceptionCode,
} from 'src/engine/metadata-modules/connected-account/connected-account.exception';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';

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
      where: this.getUserConditions({ userWorkspaceId, workspaceId }),
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

  private getUserConditions({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id?: string;
    userWorkspaceId: string;
    workspaceId: string;
  }): FindOptionsWhere<ConnectedAccountEntity> {
    return {
      ...(isDefined(id) ? { id } : {}),
      workspaceId,
      userWorkspaceId,
    };
  }

  private getWorkspaceSharedConditions({
    id,
    workspaceId,
  }: {
    id?: string;
    workspaceId: string;
  }): FindOptionsWhere<ConnectedAccountEntity> {
    return {
      ...(isDefined(id) ? { id } : {}),
      workspaceId,
      visibility: 'workspace',
    };
  }

  private getAccessibleConditions({
    id,
    userWorkspaceId,
    workspaceId,
  }: {
    id?: string;
    userWorkspaceId: string | undefined;
    workspaceId: string;
  }): FindOptionsWhere<ConnectedAccountEntity>[] {
    const workspaceSharedConditions = this.getWorkspaceSharedConditions({
      id,
      workspaceId,
    });

    if (!isDefined(userWorkspaceId)) {
      return [workspaceSharedConditions];
    }

    return [
      this.getUserConditions({ id, userWorkspaceId, workspaceId }),
      workspaceSharedConditions,
    ];
  }

  async findAccessibleConnectedAccounts({
    userWorkspaceId,
    workspaceId,
    relations,
  }: {
    userWorkspaceId: string | undefined;
    workspaceId: string;
    relations?: FindOptionsRelations<ConnectedAccountEntity>;
  }): Promise<{
    userConnectedAccounts: ConnectedAccountEntity[];
    workspaceSharedConnectedAccounts: ConnectedAccountEntity[];
  }> {
    const accounts = await this.repository.find({
      where: this.getAccessibleConditions({ workspaceId, userWorkspaceId }),
      relations,
      order: { createdAt: 'ASC' },
    });

    return {
      userConnectedAccounts: accounts.filter(
        (account) => account.userWorkspaceId === userWorkspaceId,
      ),
      workspaceSharedConnectedAccounts: accounts.filter(
        (account) => account.userWorkspaceId !== userWorkspaceId,
      ),
    };
  }

  async findAccessibleConnectedAccountById({
    id,
    userWorkspaceId,
    workspaceId,
    relations,
  }: {
    id: string;
    userWorkspaceId: string | undefined;
    workspaceId: string;
    relations?: FindOptionsRelations<ConnectedAccountEntity>;
  }): Promise<ConnectedAccountEntity | null> {
    return this.repository.findOne({
      where: this.getAccessibleConditions({ workspaceId, userWorkspaceId, id }),
      relations,
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

    if (
      connectedAccount.visibility !== 'workspace' &&
      connectedAccount.userWorkspaceId !== userWorkspaceId
    ) {
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
      where: this.getUserConditions({ userWorkspaceId, workspaceId }),
      select: ['id'],
    });

    return accounts.map((account) => account.id);
  }

  async getWorkspaceSharedConnectedAccountIds({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string[]> {
    const accounts = await this.repository.find({
      where: this.getWorkspaceSharedConditions({ workspaceId }),
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

    const [messageChannelCount, calendarChannelCount] = await Promise.all([
      this.messageChannelRepository.count({
        where: { connectedAccountId: id, workspaceId },
      }),
      this.calendarChannelRepository.count({
        where: { connectedAccountId: id, workspaceId },
      }),
    ]);

    this.logger.log(
      `WorkspaceId: ${workspaceId} Deleting connected account ${id} with ${messageChannelCount} message channel(s) and ${calendarChannelCount} calendar channel(s)`,
    );

    await this.appOAuthRevokeService.revokeIfApp(connectedAccount);

    await this.repository.delete({ id, workspaceId });

    return connectedAccount;
  }
}
