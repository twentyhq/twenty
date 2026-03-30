import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate } from 'uuid';
import {
  type FindOneOptions,
  type FindOptionsWhere,
  Repository,
} from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type MessageFolderWorkspaceEntity } from 'src/modules/messaging/common/standard-objects/message-folder.workspace-entity';

@Injectable()
export class MessageFolderDataAccessService {
  private readonly logger = new Logger(MessageFolderDataAccessService.name);

  constructor(
    @InjectRepository(MessageFolderEntity)
    private readonly coreRepository: Repository<MessageFolderEntity>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private async isMigrated(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      workspaceId,
    );
  }

  private async resolveParentFolderIdForCore(
    workspaceId: string,
    parentFolderId: string | null,
    messageChannelId: string | undefined,
  ): Promise<string | null> {
    if (!isNonEmptyString(parentFolderId)) {
      return null;
    }

    if (uuidValidate(parentFolderId)) {
      return parentFolderId;
    }

    if (!isDefined(messageChannelId)) {
      return null;
    }

    const parentFolder = await this.coreRepository.findOne({
      where: {
        workspaceId,
        messageChannelId,
        externalId: parentFolderId,
      },
      select: ['id'],
    });

    return parentFolder?.id ?? null;
  }

  private async toCore(
    workspaceId: string,
    data: Partial<MessageFolderWorkspaceEntity>,
    messageChannelId?: string,
  ): Promise<Record<string, unknown>> {
    const coreData: Record<string, unknown> = { ...data, workspaceId };

    const channelId = (coreData.messageChannelId as string) ?? messageChannelId;

    if ('parentFolderId' in coreData) {
      coreData.parentFolderId = await this.resolveParentFolderIdForCore(
        workspaceId,
        coreData.parentFolderId as string | null,
        channelId,
      );
    }

    return coreData;
  }

  async getWorkspaceRepository(workspaceId: string) {
    return this.globalWorkspaceOrmManager.getRepository<MessageFolderWorkspaceEntity>(
      workspaceId,
      'messageFolder',
    );
  }

  async findOne(
    workspaceId: string,
    options: FindOneOptions<MessageFolderWorkspaceEntity>,
  ): Promise<MessageFolderWorkspaceEntity | null> {
    if (await this.isMigrated(workspaceId)) {
      const where = options.where as Record<string, unknown>;
      const coreWhere = Array.isArray(where)
        ? where.map((whereItem) => ({
            ...(whereItem as Record<string, unknown>),
            workspaceId,
          }))
        : {
            ...(where as Record<string, unknown>),
            workspaceId,
          };

      return this.coreRepository.findOne({
        ...options,
        where: coreWhere,
      } as FindOneOptions<MessageFolderEntity>) as unknown as Promise<MessageFolderWorkspaceEntity | null>;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.findOne(options);
  }

  async find(
    workspaceId: string,
    where?: FindOptionsWhere<MessageFolderWorkspaceEntity>,
  ): Promise<MessageFolderWorkspaceEntity[]> {
    if (await this.isMigrated(workspaceId)) {
      return this.coreRepository.find({
        where: {
          ...(where as Record<string, unknown>),
          workspaceId,
        } as FindOptionsWhere<MessageFolderEntity>,
      }) as unknown as Promise<MessageFolderWorkspaceEntity[]>;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.find({ where });
  }

  async save(
    workspaceId: string,
    data: Partial<MessageFolderWorkspaceEntity>,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    const savedData = await workspaceRepository.save(data);

    if (await this.isMigrated(workspaceId)) {
      try {
        const coreData = await this.toCore(workspaceId, savedData);

        await this.coreRepository.save(
          coreData as unknown as MessageFolderEntity,
        );
      } catch (error) {
        this.logger.error(
          `Failed to dual-write messageFolder to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async update(
    workspaceId: string,
    where: FindOptionsWhere<MessageFolderWorkspaceEntity>,
    data: Partial<MessageFolderWorkspaceEntity>,
    manager?: WorkspaceEntityManager,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.update(where, data, manager);

    if (await this.isMigrated(workspaceId)) {
      try {
        const coreData = await this.toCore(
          workspaceId,
          data,
          (where as Record<string, unknown>).messageChannelId as string,
        );

        await this.coreRepository.update(
          { ...where, workspaceId } as FindOptionsWhere<MessageFolderEntity>,
          coreData,
        );
      } catch (error) {
        this.logger.error(
          `Failed to dual-write messageFolder update to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async delete(
    workspaceId: string,
    where: FindOptionsWhere<MessageFolderWorkspaceEntity>,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.delete(where);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.delete({
          ...where,
          workspaceId,
        } as FindOptionsWhere<MessageFolderEntity>);
      } catch (error) {
        this.logger.error(
          `Failed to dual-write messageFolder delete to core: ${error}`,
        );
        throw error;
      }
    }
  }
}
