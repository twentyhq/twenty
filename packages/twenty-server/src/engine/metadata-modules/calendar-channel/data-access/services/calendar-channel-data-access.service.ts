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
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { type WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type CalendarChannelWorkspaceEntity } from 'src/modules/calendar/common/standard-objects/calendar-channel.workspace-entity';

@Injectable()
export class CalendarChannelDataAccessService {
  private readonly logger = new Logger(CalendarChannelDataAccessService.name);

  constructor(
    @InjectRepository(CalendarChannelEntity)
    private readonly coreRepository: Repository<CalendarChannelEntity>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly connectedAccountDataAccessService: ConnectedAccountDataAccessService,
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
    return this.globalWorkspaceOrmManager.getRepository<CalendarChannelWorkspaceEntity>(
      workspaceId,
      'calendarChannel',
    );
  }

  async findOne(
    workspaceId: string,
    options: FindOneOptions<CalendarChannelWorkspaceEntity>,
  ): Promise<CalendarChannelWorkspaceEntity | null> {
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

      const coreRelations = requestedRelations.filter(
        (r) => r !== 'connectedAccount',
      );

      const result = await this.coreRepository.findOne({
        ...options,
        where: coreWhere,
        relations: coreRelations,
      } as FindOneOptions<CalendarChannelEntity>);

      if (!result) {
        return null;
      }

      const workspaceResult =
        result as unknown as CalendarChannelWorkspaceEntity;

      if (needsConnectedAccount) {
        const connectedAccount =
          await this.connectedAccountDataAccessService.findOne(workspaceId, {
            where: { id: result.connectedAccountId },
          });

        if (connectedAccount) {
          workspaceResult.connectedAccount = connectedAccount;
        }
      }

      return workspaceResult;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.findOne(options);
  }

  async find(
    workspaceId: string,
    whereOrOptions?:
      | FindOptionsWhere<CalendarChannelWorkspaceEntity>
      | FindManyOptions<CalendarChannelWorkspaceEntity>,
  ): Promise<CalendarChannelWorkspaceEntity[]> {
    if (
      whereOrOptions !== undefined &&
      typeof whereOrOptions === 'object' &&
      whereOrOptions !== null &&
      !Array.isArray(whereOrOptions) &&
      'where' in whereOrOptions
    ) {
      const options =
        whereOrOptions as FindManyOptions<CalendarChannelWorkspaceEntity>;

      if (await this.isMigrated(workspaceId)) {
        const { where } = options;

        const coreWhere = Array.isArray(where)
          ? await Promise.all(
              where.map((whereItem) =>
                this.toCoreWhere(
                  workspaceId,
                  whereItem as Record<string, unknown>,
                ),
              ),
            )
          : await this.toCoreWhere(
              workspaceId,
              where as Record<string, unknown>,
            );

        return this.coreRepository.find({
          ...options,
          where: coreWhere,
        } as FindManyOptions<CalendarChannelEntity>) as unknown as Promise<
          CalendarChannelWorkspaceEntity[]
        >;
      }

      const workspaceRepository =
        await this.getWorkspaceRepository(workspaceId);

      return workspaceRepository.find(options);
    }

    const where = whereOrOptions as
      | FindOptionsWhere<CalendarChannelWorkspaceEntity>
      | undefined;

    if (await this.isMigrated(workspaceId)) {
      const coreWhere = where
        ? await this.toCoreWhere(workspaceId, where as Record<string, unknown>)
        : { workspaceId };

      return this.coreRepository.find({
        where: coreWhere,
      } as FindManyOptions<CalendarChannelEntity>) as unknown as Promise<
        CalendarChannelWorkspaceEntity[]
      >;
    }

    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    return workspaceRepository.find({ where });
  }

  async save(
    workspaceId: string,
    data: Partial<CalendarChannelWorkspaceEntity>,
    manager?: WorkspaceEntityManager,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.save(data, {}, manager);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.save({
          ...data,
          workspaceId,
        } as unknown as CalendarChannelEntity);
      } catch (error) {
        this.logger.error(
          `Failed to dual-write calendarChannel to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async update(
    workspaceId: string,
    where: FindOptionsWhere<CalendarChannelWorkspaceEntity>,
    data: Partial<CalendarChannelWorkspaceEntity>,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.update(where, data);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.update(
          { ...where, workspaceId } as FindOptionsWhere<CalendarChannelEntity>,
          data as Record<string, unknown>,
        );
      } catch (error) {
        this.logger.error(
          `Failed to dual-write calendarChannel update to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async increment(
    workspaceId: string,
    where: FindOptionsWhere<CalendarChannelWorkspaceEntity>,
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
          } as FindOptionsWhere<CalendarChannelEntity>,
          propertyPath,
          value,
        );
      } catch (error) {
        this.logger.error(
          `Failed to dual-write calendarChannel increment to core: ${error}`,
        );
        throw error;
      }
    }
  }

  async delete(
    workspaceId: string,
    where: FindOptionsWhere<CalendarChannelWorkspaceEntity>,
  ): Promise<void> {
    const workspaceRepository = await this.getWorkspaceRepository(workspaceId);

    await workspaceRepository.delete(where);

    if (await this.isMigrated(workspaceId)) {
      try {
        await this.coreRepository.delete({
          ...where,
          workspaceId,
        } as FindOptionsWhere<CalendarChannelEntity>);
      } catch (error) {
        this.logger.error(
          `Failed to dual-write calendarChannel delete to core: ${error}`,
        );
        throw error;
      }
    }
  }
}
