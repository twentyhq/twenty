import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';

import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type FindOneOptions,
  type FindOptionsWhere,
  In,
  Repository,
} from 'typeorm';

import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type ConnectedAccountWorkspaceEntity } from 'src/modules/connected-account/standard-objects/connected-account.workspace-entity';
import { type WorkspaceMemberWorkspaceEntity } from 'src/modules/workspace-member/standard-objects/workspace-member.workspace-entity';

@Injectable()
export class ConnectedAccountDataAccessService {
  private readonly logger = new Logger(ConnectedAccountDataAccessService.name);

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly coreRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
  ) {}

  private async isMigrated(workspaceId: string): Promise<boolean> {
    return this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      workspaceId,
    );
  }

  private async resolveUserWorkspaceId(
    workspaceId: string,
    workspaceMemberId: string,
  ): Promise<string | null> {
    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMember = await workspaceMemberRepository.findOne({
      where: { id: workspaceMemberId },
    });

    if (!workspaceMember) {
      return null;
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: workspaceMember.userId, workspaceId },
    });

    return userWorkspace?.id ?? null;
  }

  private async toCore(
    workspaceId: string,
    data: Partial<ConnectedAccountWorkspaceEntity>,
  ): Promise<Partial<ConnectedAccountEntity>> {
    const {
      handleAliases,
      lastSyncHistoryId: _lastSyncHistoryId,
      accountOwnerId,
      ...rest
    } = data as Record<string, unknown>;

    const coreData: Record<string, unknown> = { ...rest };

    if (handleAliases !== undefined) {
      if (Array.isArray(handleAliases)) {
        coreData.handleAliases = handleAliases;
      } else if (isNonEmptyString(handleAliases)) {
        coreData.handleAliases = handleAliases
          .split(',')
          .map((alias: string) => alias.trim());
      } else {
        coreData.handleAliases = null;
      }
    }

    if (accountOwnerId !== undefined) {
      const userWorkspaceId = await this.resolveUserWorkspaceId(
        workspaceId,
        accountOwnerId as string,
      );

      if (!userWorkspaceId) {
        this.logger.warn(
          `Could not resolve userWorkspaceId for workspaceMember ${accountOwnerId}`,
        );
      }

      coreData.userWorkspaceId = userWorkspaceId;
    }

    return coreData as Partial<ConnectedAccountEntity>;
  }

  private async toCoreWhere(
    workspaceId: string,
    where: Record<string, unknown>,
  ): Promise<FindOptionsWhere<ConnectedAccountEntity>> {
    const { accountOwnerId, ...rest } = where;
    const coreWhere: Record<string, unknown> = { ...rest, workspaceId };

    if (accountOwnerId !== undefined) {
      const userWorkspaceId = await this.resolveUserWorkspaceId(
        workspaceId,
        accountOwnerId as string,
      );

      if (userWorkspaceId) {
        coreWhere.userWorkspaceId = userWorkspaceId;
      } else {
        this.logger.warn(
          `toCoreWhere: could not resolve userWorkspaceId for workspaceMember ${accountOwnerId}, returning empty result`,
        );
        coreWhere.id = '00000000-0000-0000-0000-000000000000';
      }
    }

    return coreWhere as FindOptionsWhere<ConnectedAccountEntity>;
  }

  private async fromCoreEntities(
    workspaceId: string,
    entities: ConnectedAccountEntity[],
  ): Promise<ConnectedAccountWorkspaceEntity[]> {
    if (entities.length === 0) {
      return [];
    }

    const userWorkspaceIds = entities
      .map((entity) => entity.userWorkspaceId)
      .filter(isDefined);

    const userWorkspaces =
      userWorkspaceIds.length > 0
        ? await this.userWorkspaceRepository.find({
            where: { id: In(userWorkspaceIds) },
            select: ['id', 'userId'],
          })
        : [];

    const userIdByUserWorkspaceId = new Map(
      userWorkspaces.map((userWorkspace) => [
        userWorkspace.id,
        userWorkspace.userId,
      ]),
    );

    const uniqueUserIds = [
      ...new Set(userWorkspaces.map((userWorkspace) => userWorkspace.userId)),
    ];

    const workspaceMemberRepository =
      await this.globalWorkspaceOrmManager.getRepository<WorkspaceMemberWorkspaceEntity>(
        workspaceId,
        'workspaceMember',
      );

    const workspaceMembers =
      uniqueUserIds.length > 0
        ? await workspaceMemberRepository.find({
            where: { userId: In(uniqueUserIds) },
          })
        : [];

    const workspaceMemberIdByUserId = new Map(
      workspaceMembers.map((workspaceMember) => [
        workspaceMember.userId,
        workspaceMember.id,
      ]),
    );

    return entities.map((entity) => {
      const userId = entity.userWorkspaceId
        ? userIdByUserWorkspaceId.get(entity.userWorkspaceId)
        : undefined;

      const accountOwnerId = userId
        ? workspaceMemberIdByUserId.get(userId)
        : undefined;

      const handleAliases = Array.isArray(entity.handleAliases)
        ? entity.handleAliases.join(',')
        : (entity.handleAliases ?? '');

      return {
        ...entity,
        handleAliases,
        accountOwnerId: accountOwnerId ?? null,
      } as unknown as ConnectedAccountWorkspaceEntity;
    });
  }

  async getWorkspaceRepository(workspaceId: string) {
    return this.globalWorkspaceOrmManager.getRepository<ConnectedAccountWorkspaceEntity>(
      workspaceId,
      'connectedAccount',
    );
  }

  async findOne(
    workspaceId: string,
    options: FindOneOptions<ConnectedAccountWorkspaceEntity>,
  ): Promise<ConnectedAccountWorkspaceEntity | null> {
    if (await this.isMigrated(workspaceId)) {
      const where = options.where as Record<string, unknown>;
      const coreWhere = Array.isArray(where)
        ? await Promise.all(
            where.map((whereItem: Record<string, unknown>) =>
              this.toCoreWhere(workspaceId, whereItem),
            ),
          )
        : await this.toCoreWhere(workspaceId, where);

      const coreResult = await this.coreRepository.findOne({
        ...options,
        where: coreWhere,
      } as FindOneOptions<ConnectedAccountEntity>);

      if (!coreResult) {
        return null;
      }

      const [transformed] = await this.fromCoreEntities(workspaceId, [
        coreResult,
      ]);

      return transformed ?? null;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.findOne(options);
  }

  async find(
    workspaceId: string,
    where?: FindOptionsWhere<ConnectedAccountWorkspaceEntity>,
  ): Promise<ConnectedAccountWorkspaceEntity[]> {
    if (await this.isMigrated(workspaceId)) {
      const coreWhere = where
        ? await this.toCoreWhere(workspaceId, where as Record<string, unknown>)
        : { workspaceId };

      const coreResults = await this.coreRepository.find({
        where: coreWhere,
      });

      return this.fromCoreEntities(workspaceId, coreResults);
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.find({ where });
  }

  async save(
    workspaceId: string,
    data: Partial<ConnectedAccountWorkspaceEntity>,
    manager?: WorkspaceEntityManager,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.save(data, {}, manager);

    if (await this.isMigrated(workspaceId)) {
      try {
        const coreData = await this.toCore(workspaceId, data);

        await this.coreRepository.save({
          ...coreData,
          workspaceId,
        } as ConnectedAccountEntity);
      } catch (error) {
        this.logger.error(
          `Failed to dual-write connectedAccount to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async update(
    workspaceId: string,
    where: FindOptionsWhere<ConnectedAccountWorkspaceEntity>,
    data: Partial<ConnectedAccountWorkspaceEntity>,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.update(where, data);

    if (await this.isMigrated(workspaceId)) {
      try {
        const coreData = await this.toCore(workspaceId, data);
        const coreWhere = await this.toCoreWhere(
          workspaceId,
          where as Record<string, unknown>,
        );

        await this.coreRepository.update(
          coreWhere,
          coreData as Record<string, unknown>,
        );
      } catch (error) {
        this.logger.error(
          `Failed to dual-write connectedAccount update to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async delete(
    workspaceId: string,
    where: FindOptionsWhere<ConnectedAccountWorkspaceEntity>,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.delete(where);

    if (await this.isMigrated(workspaceId)) {
      try {
        const coreWhere = await this.toCoreWhere(
          workspaceId,
          where as Record<string, unknown>,
        );

        await this.coreRepository.delete(coreWhere);
      } catch (error) {
        this.logger.error(
          `Failed to dual-write connectedAccount delete to core: ${error}`,
        );
        throw error;
      }
    }
  }
}
