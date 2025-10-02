import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/core-modules/common/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/registry/workspace-migration-runner-action-handler-registry.service';

@Injectable()
export class WorkspaceMigrationRunnerV2Service {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationRunnerActionHandlerRegistry: WorkspaceMigrationRunnerActionHandlerRegistryService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly logger: LoggerService,
  ) {}

  run = async ({
    actions,
    workspaceId,
    relatedFlatEntityMapsKeys,
  }: WorkspaceMigrationV2): Promise<AllFlatEntityMaps> => {
    this.logger.time('Runner', 'Total execution');
    this.logger.time('Runner', 'Initial cache retrieval');

    const queryRunner = this.coreDataSource.createQueryRunner();

    let allFlatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatEntities: relatedFlatEntityMapsKeys,
        },
      );

    this.logger.timeEnd('Runner', 'Initial cache retrieval');
    this.logger.time('Runner', 'Transaction execution');

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let flatEntityMapsToInvalidate: (keyof AllFlatEntityMaps)[] = [];

    try {
      for (const action of actions) {
        const partialOptimisticCache =
          await this.workspaceMigrationRunnerActionHandlerRegistry.executeActionHandler(
            {
              actionType: action.type,
              context: {
                action,
                allFlatEntityMaps,
                queryRunner,
                workspaceId,
              },
            },
          );
        const optimisticallyUpdatedFlatEntityMapsKeys = Object.keys(
          partialOptimisticCache,
        ) as (keyof AllFlatEntityMaps)[];

        flatEntityMapsToInvalidate = [
          ...optimisticallyUpdatedFlatEntityMapsKeys,
          ...flatEntityMapsToInvalidate,
        ];

        allFlatEntityMaps = {
          ...allFlatEntityMaps,
          ...partialOptimisticCache,
        };
      }

      await queryRunner.commitTransaction();

      this.logger.timeEnd('Runner', 'Transaction execution');
      this.logger.time('Runner', 'Cache invalidation');

      const flatEntitiesCacheToInvalidate = [
        ...new Set([
          ...flatEntityMapsToInvalidate,
          ...(relatedFlatEntityMapsKeys ?? []),
        ]),
      ];

      if (
        flatEntitiesCacheToInvalidate.includes('flatObjectMetadataMaps') ||
        flatEntitiesCacheToInvalidate.includes('flatFieldMetadataMaps')
      ) {
        // Temporarily invalidation old cache too until it's deprecated
        await this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        );
        await this.workspacePermissionsCacheService.recomputeRolesPermissionsCache(
          {
            workspaceId,
          },
        );
      }

      await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
        workspaceId,
        flatEntities: [
          ...new Set([
            ...flatEntityMapsToInvalidate,
            ...(relatedFlatEntityMapsKeys ?? []),
          ]),
        ],
      });

      this.logger.timeEnd('Runner', 'Cache invalidation');
      this.logger.timeEnd('Runner', 'Total execution');

      return allFlatEntityMaps;
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        try {
          await queryRunner.rollbackTransaction();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.trace(`Failed to rollback transaction: ${error.message}`);
        }
      }

      const invertedActions = actions.reverse();

      for (const invertedAction of invertedActions) {
        await this.workspaceMigrationRunnerActionHandlerRegistry.executeActionHandler(
          {
            actionType: invertedAction.type,
            context: {
              action: invertedAction,
              allFlatEntityMaps: allFlatEntityMaps,
              queryRunner,
              workspaceId,
            },
            rollback: true,
          },
        );
      }

      throw new WorkspaceQueryRunnerException(
        error.message,
        WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  };
}
