import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import {
  WorkspaceQueryRunnerException,
  WorkspaceQueryRunnerExceptionCode,
} from 'src/engine/api/graphql/workspace-query-runner/workspace-query-runner.exception';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION } from 'src/engine/metadata-modules/view/constants/find-all-core-views-graphql-operation.constant';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration';
import { WorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { WorkspaceMigrationRunnerActionHandlerRegistryService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/registry/workspace-migration-runner-action-handler-registry.service';
import { AllMetadataName } from 'twenty-shared/metadata';

@Injectable()
export class WorkspaceMigrationRunnerService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceMigrationRunnerActionHandlerRegistry: WorkspaceMigrationRunnerActionHandlerRegistryService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly logger: LoggerService,
  ) {}

  private async invalidateCachePostExecution({
    impactedMetadataNames,
    workspaceId,
    actions,
  }: {
    impactedMetadataNames: AllMetadataName[];
    workspaceId: string;
    actions: WorkspaceMigrationAction[];
  }): Promise<void> {
    const metadataAndRelatedMetadataNames = [
      ...new Set([
        ...impactedMetadataNames,
        ...impactedMetadataNames.flatMap(getMetadataRelatedMetadataNames),
      ]),
    ];
    const flatEntitiesCacheToInvalidate = metadataAndRelatedMetadataNames.map(
      getMetadataFlatEntityMapsKey,
    );

    this.logger.time(
      'Runner',
      `Cache invalidation ${flatEntitiesCacheToInvalidate.join()}`,
    );

    await this.flatEntityMapsCacheService.invalidateFlatEntityMaps({
      workspaceId,
      flatMapsKeys: flatEntitiesCacheToInvalidate,
    });

    const invalidationResults = await Promise.allSettled(
      this.getLegacyCacheInvalidationPromises({
        workspaceMigration: {
          actions,
          workspaceId,
        },
      }),
    );

    const invalidationFailures = invalidationResults.filter(
      (result) => result.status === 'rejected',
    );

    if (invalidationFailures.length > 0) {
      invalidationFailures.forEach((err) =>
        this.logger.error(
          `Failed to invalidate a legacy cache ${err.reason}`,
          'Runner',
        ),
      );
      throw new Error(
        `Failed to invalidate ${invalidationFailures.length} cache operations`,
      );
    }

    this.logger.timeEnd(
      'Runner',
      `Cache invalidation ${flatEntitiesCacheToInvalidate.join()}`,
    );
  }

  private getLegacyCacheInvalidationPromises({
    workspaceMigration: { actions, workspaceId },
  }: {
    workspaceMigration: Omit<WorkspaceMigration, 'relatedFlatEntityMapsKeys'>;
  }): Promise<void>[] {
    const asyncOperations: Promise<void>[] = [];
    const shouldIncrementMetadataGraphqlSchemaVersion = actions.some(
      (action) => {
        return (
          action.metadataName === 'objectMetadata' ||
          action.metadataName === 'fieldMetadata'
        );
      },
    );

    if (shouldIncrementMetadataGraphqlSchemaVersion) {
      asyncOperations.push(
        this.workspaceMetadataVersionService.incrementMetadataVersion(
          workspaceId,
        ),
      );
    }

    const viewRelatedMetadataNames = [
      'view',
      'viewFilter',
      'viewGroup',
      'viewField',
      'viewFilterGroup',
    ];
    const shouldInvalidFindCoreViewsGraphqlCacheOperation = actions.some(
      (action) => viewRelatedMetadataNames.includes(action.metadataName),
    );

    if (
      shouldInvalidFindCoreViewsGraphqlCacheOperation ||
      shouldIncrementMetadataGraphqlSchemaVersion
    ) {
      asyncOperations.push(
        this.workspaceCacheStorageService.flushGraphQLOperation({
          operationName: FIND_ALL_CORE_VIEWS_GRAPHQL_OPERATION,
          workspaceId,
        }),
      );
    }

    const shouldInvalidateRoleMapCache = actions.some((action) => {
      return (
        action.metadataName === 'role' || action.metadataName === 'roleTarget'
      );
    });

    if (
      shouldIncrementMetadataGraphqlSchemaVersion ||
      shouldInvalidateRoleMapCache
    ) {
      asyncOperations.push(
        this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'rolesPermissions',
          'userWorkspaceRoleMap',
          'flatRoleTargetMaps',
          'apiKeyRoleMap',
          'ORMEntityMetadatas',
          'flatRoleTargetByAgentIdMaps',
        ]),
      );
    }

    return asyncOperations;
  }

  run = async ({
    actions,
    workspaceId,
    relatedFlatEntityMapsKeys,
  }: WorkspaceMigration): Promise<AllFlatEntityMaps> => {
    this.logger.time('Runner', 'Total execution');
    this.logger.time('Runner', 'Initial cache retrieval');

    const queryRunner = this.coreDataSource.createQueryRunner();

    let allFlatEntityMaps =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: relatedFlatEntityMapsKeys,
        },
      );

    this.logger.timeEnd('Runner', 'Initial cache retrieval');
    this.logger.time('Runner', 'Transaction execution');

    await queryRunner.connect();
    await queryRunner.startTransaction();

    let impactedMetadataNames: AllMetadataName[] = [];

    const successfullyExecutedActions: WorkspaceMigrationAction[] = [];
    try {
      for (const action of actions) {
        const result =
          await this.workspaceMigrationRunnerActionHandlerRegistry.executeActionHandler(
            {
              action,
              context: {
                action,
                allFlatEntityMaps,
                queryRunner,
                workspaceId,
              },
            },
          );

        if (result.status === 'failure') {
          if (queryRunner.isTransactionActive) {
            // TODO before merge shouldn't we throw ?
            await queryRunner
              .rollbackTransaction()
              .catch((error) =>
                console.trace(
                  `Failed to rollback transaction: ${error.message}`,
                ),
              );
          }

          const invertedActions = successfullyExecutedActions.reverse();

          for (const invertedAction of invertedActions) {
            await this.workspaceMigrationRunnerActionHandlerRegistry.executeActionRollbackHandler(
              {
                action: invertedAction,
                context: {
                  action: invertedAction,
                  allFlatEntityMaps: allFlatEntityMaps,
                  queryRunner,
                  workspaceId,
                },
              },
            );
          }

          return; // TODO before merge prastoin return failure record
        }

        const { partialOptimisticCache } = result;

        allFlatEntityMaps = {
          ...allFlatEntityMaps,
          ...partialOptimisticCache,
        };

        impactedMetadataNames = [
          ...new Set([action.metadataName, ...impactedMetadataNames]),
        ];
      }

      await queryRunner.commitTransaction();

      this.logger.timeEnd('Runner', 'Transaction execution');

      await this.invalidateCachePostExecution({
        impactedMetadataNames,
        workspaceId,
        actions,
      });

      this.logger.timeEnd('Runner', 'Total execution');

      return allFlatEntityMaps;
    } catch (error) {
      throw new WorkspaceQueryRunnerException(
        error.message,
        WorkspaceQueryRunnerExceptionCode.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  };
}
