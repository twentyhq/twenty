import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import {
  type FindManyOptions,
  type FindOneOptions,
  type FindOptionsWhere,
  Repository,
} from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { MessageFolderDataAccessService } from 'src/engine/metadata-modules/message-folder/data-access/services/message-folder-data-access.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type MessageChannelWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-channel.workspace-entity';

@Injectable()
export class MessageChannelDataAccessService {
  private readonly logger = new Logger(MessageChannelDataAccessService.name);

  constructor(
    @InjectRepository(MessageChannelEntity)
    private readonly coreRepository: Repository<MessageChannelEntity>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
    private readonly messageFolderDataAccessService: MessageFolderDataAccessService,
  ) {}

  private async isMigrated(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      workspaceId,
    );
  }

  private async toCoreWhere(
    workspaceId: string,
    where: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const coreWhere: Record<string, unknown> = { ...where, workspaceId };

    if (
      coreWhere.connectedAccount &&
      typeof coreWhere.connectedAccount === 'object'
    ) {
      const connectedAccountWhere = {
        ...(coreWhere.connectedAccount as Record<string, unknown>),
      };

      if ('accountOwnerId' in connectedAccountWhere) {
        const { accountOwnerId, ...restConnectedAccount } =
          connectedAccountWhere;

        const resolvedConnectedAccounts =
          await this.connectedAccountDataAccessService.find(workspaceId, {
            accountOwnerId,
          } as never);

        if (resolvedConnectedAccounts.length > 0) {
          coreWhere.connectedAccountId = resolvedConnectedAccounts[0].id;
        } else {
          coreWhere.connectedAccountId = '00000000-0000-0000-0000-000000000000';
        }

        if (Object.keys(restConnectedAccount).length > 0) {
          coreWhere.connectedAccount = restConnectedAccount;
        } else {
          delete coreWhere.connectedAccount;
        }
      }
    }

    return coreWhere;
  }

  async getWorkspaceRepository(workspaceId: string) {
    return this.globalWorkspaceOrmManager.getRepository<MessageChannelWorkspaceEntity>(
      workspaceId,
      'messageChannel',
    );
  }

  async findOne(
    workspaceId: string,
    options: FindOneOptions<MessageChannelWorkspaceEntity>,
  ): Promise<MessageChannelWorkspaceEntity | null> {
    if (await this.isMigrated(workspaceId)) {
      const where = options.where as Record<string, unknown>;
      const coreWhere = Array.isArray(where)
        ? await Promise.all(
            where.map((whereItem: Record<string, unknown>) =>
              this.toCoreWhere(workspaceId, whereItem),
            ),
          )
        : await this.toCoreWhere(workspaceId, where);

      const requestedRelations =
        (options.relations as string[] | undefined)?.slice() ?? [];

      const needsConnectedAccount =
        requestedRelations.includes('connectedAccount');

      const needsMessageFolders = requestedRelations.includes('messageFolders');

      const coreRelations = requestedRelations.filter(
        (r) => r !== 'connectedAccount' && r !== 'messageFolders',
      );

      const result = await this.coreRepository.findOne({
        ...options,
        where: coreWhere,
        relations: coreRelations,
      } as FindOneOptions<MessageChannelEntity>);

      if (!result) {
        return null;
      }

      const workspaceResult =
        result as unknown as MessageChannelWorkspaceEntity;

      if (needsConnectedAccount) {
        const connectedAccount =
          await this.connectedAccountDataAccessService.findOne(workspaceId, {
            where: { id: result.connectedAccountId },
          });

        if (connectedAccount) {
          workspaceResult.connectedAccount = connectedAccount;
        }
      }

      if (needsMessageFolders) {
        const messageFolders = await this.messageFolderDataAccessService.find(
          workspaceId,
          {
            messageChannelId: result.id,
          },
        );

        workspaceResult.messageFolders =
          messageFolders as unknown as MessageChannelWorkspaceEntity['messageFolders'];
      }

      return workspaceResult;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.findOne(options);
  }

  async find(
    workspaceId: string,
    where?: FindOptionsWhere<MessageChannelWorkspaceEntity>,
  ): Promise<MessageChannelWorkspaceEntity[]> {
    if (await this.isMigrated(workspaceId)) {
      return this.coreRepository.find({
        where: {
          ...(where as Record<string, unknown>),
          workspaceId,
        } as FindOptionsWhere<MessageChannelEntity>,
      }) as unknown as Promise<MessageChannelWorkspaceEntity[]>;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.find({ where });
  }

  async findMany(
    workspaceId: string,
    options: FindManyOptions<MessageChannelWorkspaceEntity>,
  ): Promise<MessageChannelWorkspaceEntity[]> {
    if (await this.isMigrated(workspaceId)) {
      const baseWhere = options.where;

      if (!baseWhere) {
        return this.coreRepository.find({
          ...options,
          where: { workspaceId },
        } as FindManyOptions<MessageChannelEntity>) as unknown as Promise<
          MessageChannelWorkspaceEntity[]
        >;
      }

      if (Array.isArray(baseWhere)) {
        const coreWhereArray = await Promise.all(
          baseWhere.map((whereItem) =>
            this.toCoreWhere(workspaceId, whereItem as Record<string, unknown>),
          ),
        );

        return this.coreRepository.find({
          ...options,
          where: coreWhereArray,
        } as FindManyOptions<MessageChannelEntity>) as unknown as Promise<
          MessageChannelWorkspaceEntity[]
        >;
      }

      const coreWhere = await this.toCoreWhere(
        workspaceId,
        baseWhere as Record<string, unknown>,
      );

      return this.coreRepository.find({
        ...options,
        where: coreWhere,
      } as FindManyOptions<MessageChannelEntity>) as unknown as Promise<
        MessageChannelWorkspaceEntity[]
      >;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.find(options);
  }

  async save(
    workspaceId: string,
    data: Partial<MessageChannelWorkspaceEntity>,
    manager?: WorkspaceEntityManager,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.save(data, {}, manager);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.save({
          ...data,
          workspaceId,
        } as unknown as MessageChannelEntity);
      } catch (error) {
        this.logger.error(
          `Failed to dual-write messageChannel to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async update(
    workspaceId: string,
    where: FindOptionsWhere<MessageChannelWorkspaceEntity>,
    data: Partial<MessageChannelWorkspaceEntity>,
    manager?: WorkspaceEntityManager,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.update(where, data, manager);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.update(
          { ...where, workspaceId } as FindOptionsWhere<MessageChannelEntity>,
          data as never,
        );
      } catch (error) {
        this.logger.error(
          `Failed to dual-write messageChannel update to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async increment(
    workspaceId: string,
    where: FindOptionsWhere<MessageChannelWorkspaceEntity>,
    propertyPath: string,
    value: number,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.increment(where, propertyPath, value, undefined, [
      propertyPath,
      'id',
    ]);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.increment(
          {
            ...where,
            workspaceId,
          } as FindOptionsWhere<MessageChannelEntity>,
          propertyPath,
          value,
        );
      } catch (error) {
        this.logger.error(
          `Failed to dual-write messageChannel increment to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async delete(
    workspaceId: string,
    where: FindOptionsWhere<MessageChannelWorkspaceEntity>,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.delete(where);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.delete({
          ...where,
          workspaceId,
        } as FindOptionsWhere<MessageChannelEntity>);
      } catch (error) {
        this.logger.error(
          `Failed to dual-write messageChannel delete to core: ${error}`,
        );
        throw error;
      }
    }
  }
}
