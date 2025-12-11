import { Injectable, Logger } from '@nestjs/common';

import {
  AllMetadataName,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-build-orchestrator.service';
import {
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
} from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-orchestrator.type';
import { InferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/infer-deletion-from-missing-entities.type';
import { WorkspaceMigrationRunnerV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/services/workspace-migration-runner-v2.service';
import { WorkspaceMigrationV2Exception } from 'src/engine/workspace-manager/workspace-migration.exception';

type ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs = {
  workspaceId: string;
  allFlatEntityOperationByMetadataName: {
    [P in AllMetadataName]?: FlatEntityToCreateDeleteUpdate<P>;
  };
  isSystemBuild?: boolean;
};

@Injectable()
export class WorkspaceMigrationValidateBuildAndRunService {
  private readonly logger = new Logger(
    WorkspaceMigrationValidateBuildAndRunService.name,
  );

  constructor(
    private readonly workspaceMigrationRunnerV2Service: WorkspaceMigrationRunnerV2Service,
    private readonly workspaceMigrationBuildOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

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
      await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        allFlatEntityMapsCacheKeysToCompute,
      );

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

    return {
      allRelatedFlatEntityMaps,
      dependencyAllFlatEntityMaps,
    };
  }

  private async computeFromToAllFlatEntityMapsAndBuildOptions({
    allFlatEntityOperationByMetadataName,
    workspaceId,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<{
    fromToAllFlatEntityMaps: WorkspaceMigrationOrchestratorBuildArgs['fromToAllFlatEntityMaps'];
    inferDeletionFromMissingEntities: InferDeletionFromMissingEntities;
    dependencyAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
  }> {
    const { allRelatedFlatEntityMaps, dependencyAllFlatEntityMaps } =
      await this.computeAllRelatedFlatEntityMaps({
        allFlatEntityOperationByMetadataName,
        workspaceId,
      });

    const fromToAllFlatEntityMaps: WorkspaceMigrationOrchestratorBuildArgs['fromToAllFlatEntityMaps'] =
      {};
    const inferDeletionFromMissingEntities: InferDeletionFromMissingEntities =
      {};
    const allMetadataNameToCompare = Object.keys(
      allFlatEntityOperationByMetadataName,
    ) as AllMetadataName[];

    for (const metadataName of allMetadataNameToCompare) {
      const tmp = allFlatEntityOperationByMetadataName[metadataName];

      if (!isDefined(tmp)) {
        throw new Error('Should never occurs');
      }
      const { flatEntityToCreate, flatEntityToDelete, flatEntityToUpdate } =
        tmp;
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);
      const flatEntityMaps = allRelatedFlatEntityMaps[flatEntityMapsKey];

      // @ts-expect-error Metadata flat entity maps cache key and metadataName colliding
      fromToAllFlatEntityMaps[flatEntityMapsKey] = computeFlatEntityMapsFromTo({
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
    };
  }

  public async validateBuildAndRunWorkspaceMigration({
    allFlatEntityOperationByMetadataName: allFlatEntities,
    workspaceId,
    isSystemBuild = false,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<
    WorkspaceMigrationOrchestratorFailedResult | undefined
  > {
    const {
      fromToAllFlatEntityMaps,
      inferDeletionFromMissingEntities,
      dependencyAllFlatEntityMaps,
    } = await this.computeFromToAllFlatEntityMapsAndBuildOptions({
      allFlatEntityOperationByMetadataName: allFlatEntities,
      workspaceId,
    });

    const validateAndBuildResult =
      await this.workspaceMigrationBuildOrchestratorService
        .buildWorkspaceMigration({
          buildOptions: {
            isSystemBuild,
            inferDeletionFromMissingEntities,
          },
          fromToAllFlatEntityMaps,
          workspaceId,
          dependencyAllFlatEntityMaps,
        })
        .catch((error) => {
          this.logger.error(error);
          throw new WorkspaceMigrationV2Exception(
            WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
            error.message,
          );
        });

    if (validateAndBuildResult.status === 'fail') {
      return validateAndBuildResult;
    }

    // Note: This should be removed once we've refactored the runner optimistic rendering
    // As with the current implementation passing an empty workspace migration might result
    // in dependency flat entity maps invalidation
    if (validateAndBuildResult.workspaceMigration.actions.length === 0) {
      return;
    }

    await this.workspaceMigrationRunnerV2Service
      .run(validateAndBuildResult.workspaceMigration)
      .catch((error) => {
        this.logger.error(error);
        throw new WorkspaceMigrationV2Exception(
          WorkspaceMigrationV2ExceptionCode.RUNNER_INTERNAL_SERVER_ERROR,
          error.message,
        );
      });
  }
}
