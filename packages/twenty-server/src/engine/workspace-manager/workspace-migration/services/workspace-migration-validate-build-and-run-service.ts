import { Injectable, Logger } from '@nestjs/common';

import {
  AllMetadataName,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationV2Exception } from 'src/engine/workspace-manager/workspace-migration.exception';
import { WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY } from 'src/engine/workspace-manager/workspace-migration/constant/workspace-migration-additional-cache-data-maps-key.constant';
import {
  enrichCreateWorkspaceMigrationActionsWithIds,
  IdByUniversalIdentifierByMetadataName,
} from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import {
  FromToAllFlatEntityMaps,
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { computeUniversalFlatEntityMapsFromTo } from 'src/engine/workspace-manager/workspace-migration/utils/compute-universal-flat-entity-maps-from-to.util';
import { InferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/infer-deletion-from-missing-entities.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs = {
  workspaceId: string;
  allFlatEntityOperationByMetadataName: {
    [P in AllMetadataName]?: FlatEntityToCreateDeleteUpdate<P>;
  };
  isSystemBuild?: boolean;
  // TODO remove once application synchronization do not consume services atomically anymore
  // Should always be the universal workspace custom app id
  applicationUniversalIdentifier: string;
};

@Injectable()
export class WorkspaceMigrationValidateBuildAndRunService {
  private readonly logger = new Logger(
    WorkspaceMigrationValidateBuildAndRunService.name,
  );
  private readonly isDebugEnabled: boolean;

  constructor(
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMigrationBuildOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    twentyConfigService: TwentyConfigService,
  ) {
    const logLevels = twentyConfigService.get('LOG_LEVELS');

    this.isDebugEnabled = logLevels.includes('debug');
  }

  private async computeAllRelatedFlatEntityMaps({
    allFlatEntityOperationByMetadataName,
    workspaceId,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs) {
    const allMetadataNameToCompare = Object.keys(
      allFlatEntityOperationByMetadataName,
    ) as AllMetadataName[];
    const allDependencyMetadataName = allMetadataNameToCompare.flatMap(
      (metadataName) =>
        Object.keys(
          ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION[metadataName],
        ) as AllMetadataName[],
    );
    const allMetadataNameCacheToCompute = [
      ...new Set([...allMetadataNameToCompare, ...allDependencyMetadataName]),
    ];
    const allFlatEntityMapsCacheKeysToCompute =
      allMetadataNameCacheToCompute.map(getMetadataFlatEntityMapsKey);

    const allRelatedFlatEntityMaps =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...allFlatEntityMapsCacheKeysToCompute,
        ...WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY,
      ]);

    const initialAccumulator = allDependencyMetadataName.reduce<
      Partial<AllFlatEntityMaps>
    >(
      (allFlatEntityMaps, metadataName) => ({
        ...allFlatEntityMaps,
        [getMetadataFlatEntityMapsKey(metadataName)]:
          createEmptyFlatEntityMaps(),
      }),
      {},
    );
    const dependencyAllFlatEntityMaps = allDependencyMetadataName.reduce(
      (allFlatEntityMaps, metadataName) => {
        const metadataFlatEntityMapsKey =
          getMetadataFlatEntityMapsKey(metadataName);

        return {
          ...allFlatEntityMaps,
          [metadataFlatEntityMapsKey]:
            allRelatedFlatEntityMaps[metadataFlatEntityMapsKey],
        };
      },
      initialAccumulator,
    );

    const additionalCacheDataMaps =
      WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY.reduce<WorkspaceMigrationBuilderAdditionalCacheDataMaps>(
        (acc, additionalCacheDataMapsKey) => {
          return {
            ...acc,
            [additionalCacheDataMapsKey]:
              allRelatedFlatEntityMaps[additionalCacheDataMapsKey],
          };
        },
        {} as WorkspaceMigrationBuilderAdditionalCacheDataMaps,
      );

    return {
      allRelatedFlatEntityMaps,
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
    };
  }

  private async computeFromToAllFlatEntityMapsAndBuildOptions({
    allFlatEntityOperationByMetadataName,
    workspaceId,
    applicationUniversalIdentifier,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<{
    fromToAllFlatEntityMaps: FromToAllFlatEntityMaps;
    inferDeletionFromMissingEntities: InferDeletionFromMissingEntities;
    dependencyAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
    additionalCacheDataMaps: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
    idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
  }> {
    const {
      allRelatedFlatEntityMaps,
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
    } = await this.computeAllRelatedFlatEntityMaps({
      allFlatEntityOperationByMetadataName,
      workspaceId,
      applicationUniversalIdentifier,
    });

    const fromToAllFlatEntityMaps: FromToAllFlatEntityMaps = {};
    const inferDeletionFromMissingEntities: InferDeletionFromMissingEntities =
      {};
    const idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName =
      {};
    const allMetadataNameToCompare = Object.keys(
      allFlatEntityOperationByMetadataName,
    ) as AllMetadataName[];

    for (const metadataName of allMetadataNameToCompare) {
      const flatEntityOperations =
        allFlatEntityOperationByMetadataName[metadataName];

      if (!isDefined(flatEntityOperations)) {
        throw new Error('Should never occurs');
      }
      const { flatEntityToCreate, flatEntityToDelete, flatEntityToUpdate } =
        flatEntityOperations;

      const idByUniversalIdentifier = Object.fromEntries(
        flatEntityToCreate
          .filter(
            (
              flatEntity,
            ): flatEntity is MetadataUniversalFlatEntity<
              typeof metadataName
            > & { id: string } => isDefined(flatEntity.id),
          )
          .map((flatEntity) => [flatEntity.universalIdentifier, flatEntity.id]),
      );

      if (Object.keys(idByUniversalIdentifier).length > 0) {
        idByUniversalIdentifierByMetadataName[metadataName] =
          idByUniversalIdentifier;
      }

      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      const flatEntityMaps = allRelatedFlatEntityMaps[flatEntityMapsKey];

      // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
      fromToAllFlatEntityMaps[flatEntityMapsKey] =
        computeUniversalFlatEntityMapsFromTo({
          flatEntityMaps,
          flatEntityToCreate,
          flatEntityToDelete,
          flatEntityToUpdate,
        });

      if (flatEntityToDelete.length > 0) {
        inferDeletionFromMissingEntities[metadataName] = true;
      }
    }

    return {
      fromToAllFlatEntityMaps,
      inferDeletionFromMissingEntities,
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
      idByUniversalIdentifierByMetadataName,
    };
  }

  public async validateBuildAndRunWorkspaceMigrationFromTo(
    args: WorkspaceMigrationOrchestratorBuildArgs & {
      idByUniversalIdentifierByMetadataName?: IdByUniversalIdentifierByMetadataName;
    },
  ) {
    const { idByUniversalIdentifierByMetadataName, ...buildArgs } = args;

    const validateAndBuildResult =
      await this.workspaceMigrationBuildOrchestratorService
        .buildWorkspaceMigration(buildArgs)
        .catch((error) => {
          this.logger.error(error);
          throw new WorkspaceMigrationV2Exception(
            WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
            error.message,
          );
        });

    if (validateAndBuildResult.status === 'fail') {
      if (this.isDebugEnabled) {
        this.logger.debug(JSON.stringify(validateAndBuildResult, null, 2));
      }

      return validateAndBuildResult;
    }

    if (validateAndBuildResult.workspaceMigration.actions.length === 0) {
      return undefined;
    }

    const workspaceMigration = isDefined(idByUniversalIdentifierByMetadataName)
      ? enrichCreateWorkspaceMigrationActionsWithIds({
          idByUniversalIdentifierByMetadataName,
          workspaceMigration: validateAndBuildResult.workspaceMigration,
        })
      : validateAndBuildResult.workspaceMigration;

    await this.workspaceMigrationRunnerService.run(workspaceMigration);
  }

  public async validateBuildAndRunWorkspaceMigration({
    allFlatEntityOperationByMetadataName: allFlatEntities,
    workspaceId,
    isSystemBuild = false,
    applicationUniversalIdentifier,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<
    WorkspaceMigrationOrchestratorFailedResult | undefined
  > {
    const {
      fromToAllFlatEntityMaps,
      inferDeletionFromMissingEntities,
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
      idByUniversalIdentifierByMetadataName,
    } = await this.computeFromToAllFlatEntityMapsAndBuildOptions({
      allFlatEntityOperationByMetadataName: allFlatEntities,
      workspaceId,
      applicationUniversalIdentifier,
    });

    return await this.validateBuildAndRunWorkspaceMigrationFromTo({
      applicationUniversalIdentifier,
      buildOptions: {
        isSystemBuild,
        inferDeletionFromMissingEntities,
      },
      fromToAllFlatEntityMaps,
      workspaceId,
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
      idByUniversalIdentifierByMetadataName,
    });
  }
}
