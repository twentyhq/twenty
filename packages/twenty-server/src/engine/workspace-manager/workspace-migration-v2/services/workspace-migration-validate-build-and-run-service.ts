import { Injectable, Logger } from '@nestjs/common';

import {
  AllMetadataName,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';

import { ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION } from 'src/engine/metadata-modules/flat-entity/constant/all-metadata-required-metadata-for-validation.constant';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { ComputeFlatEntityMapsFromToArgs } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
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
import { isDefined } from 'twenty-shared/utils';

type ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs = {
  workspaceId: string;
  allFlatEntities: {
    [P in AllMetadataName]?: ComputeFlatEntityMapsFromToArgs<P>;
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

  private async computeFromToAllFlatEntityMapsAndBuildOptions({
    allFlatEntities,
    workspaceId,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<{
    fromToAllFlatEntityMaps: WorkspaceMigrationOrchestratorBuildArgs['fromToAllFlatEntityMaps'];
    inferDeletionFromMissingEntities: InferDeletionFromMissingEntities;
    dependencyAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
  }> {
    const allObjectMetadataNames = Object.keys(
      allFlatEntities,
    ) as AllMetadataName[];
    const fromToAllFlatEntityMaps: WorkspaceMigrationOrchestratorBuildArgs['fromToAllFlatEntityMaps'] =
      {};
    const inferDeletionFromMissingEntities: InferDeletionFromMissingEntities =
      {};

    const allDependencyMetadataName: AllMetadataName[] = [];

    for (const metadataName of allObjectMetadataNames) {
      const tmp = allFlatEntities[metadataName];
      if (!isDefined(tmp)) {
        throw new Error('Should never occurs');
      }
      const {
        flatEntityMaps,
        flatEntityToCreate,
        flatEntityToDelete,
        flatEntityToUpdate,
      } = tmp;
      const flatEntityMapsKey = getMetadataFlatEntityMapsKey(metadataName);

      // @ts-expect-error prastoin investigate
      fromToAllFlatEntityMaps[flatEntityMapsKey] = computeFlatEntityMapsFromTo<
        typeof metadataName
      >({
        flatEntityMaps,
        flatEntityToCreate,
        flatEntityToDelete,
        flatEntityToUpdate,
      });

      if (flatEntityToDelete.length > 0) {
        inferDeletionFromMissingEntities[metadataName] = true;
      }

      const metadataDependencyMetadatNames = Object.keys(
        ALL_METADATA_REQUIRED_METADATA_FOR_VALIDATION[metadataName],
      ) as AllMetadataName[];
      allDependencyMetadataName.push(...metadataDependencyMetadatNames);
    }

    const dependencyAllFlatEntityMaps =
      await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        [...new Set(allDependencyMetadataName)].map(
          getMetadataFlatEntityMapsKey,
        ),
      );

    return {
      fromToAllFlatEntityMaps,
      inferDeletionFromMissingEntities,
      dependencyAllFlatEntityMaps,
    };
  }

  public async validateBuildAndRunWorkspaceMigration({
    allFlatEntities,
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
      allFlatEntities,
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
