import { Injectable, Logger } from '@nestjs/common';

import {
  AllMetadataName,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { MetadataEventEmitter } from 'src/engine/metadata-event-emitter/metadata-event-emitter';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { FlatEntityToCreateDeleteUpdate } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import { getSubFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-flat-entity-maps-by-application-ids-or-throw.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WorkspaceMigrationV2Exception } from 'src/engine/workspace-manager/workspace-migration.exception';
import { WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY } from 'src/engine/workspace-manager/workspace-migration/constant/workspace-migration-additional-cache-data-maps-key.constant';
import {
  enrichCreateWorkspaceMigrationActionsWithIds,
  IdByUniversalIdentifierByMetadataName,
} from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { WorkspaceMigrationBuildOrchestratorService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-build-orchestrator.service';
import { WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import {
  FromToAllUniversalFlatEntityMaps,
  WorkspaceMigrationOrchestratorBuildArgs,
  WorkspaceMigrationOrchestratorFailedResult,
  WorkspaceMigrationOrchestratorSuccessfulResult,
} from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { computeUniversalFlatEntityMapsFromToThroughMutation } from 'src/engine/workspace-manager/workspace-migration/utils/compute-universal-flat-entity-maps-from-to-through-mutation.util';
import { InferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/infer-deletion-from-missing-entities.type';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs = {
  workspaceId: string;
  allFlatEntityOperationByMetadataName: {
    [P in AllMetadataName]?: FlatEntityToCreateDeleteUpdate<P>;
  };
  isSystemBuild?: boolean;
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
    private readonly metadataEventEmitter: MetadataEventEmitter,
    twentyConfigService: TwentyConfigService,
  ) {
    const logLevels = twentyConfigService.get('LOG_LEVELS');

    this.isDebugEnabled = logLevels.includes('debug');
  }

  private async computeAllRelatedFlatEntityMaps({
    allFlatEntityOperationByMetadataName,
    workspaceId,
    applicationUniversalIdentifier,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs) {
    const allMetadataNameToCompare = Object.keys(
      allFlatEntityOperationByMetadataName,
    ) as AllMetadataName[];
    const allMetadataNameCacheToCompute = [
      ...new Set([
        ...allMetadataNameToCompare,
        ...allMetadataNameToCompare.flatMap(
          getMetadataRelatedMetadataNamesForValidation,
        ),
      ]),
    ];
    const allFlatEntityMapsCacheKeysToCompute =
      allMetadataNameCacheToCompute.map(getMetadataFlatEntityMapsKey);

    const { flatApplicationMaps, ...allRelatedFlatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...allFlatEntityMapsCacheKeysToCompute,
        ...WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY,
        'flatApplicationMaps',
      ]);

    const initialAccumulator = allMetadataNameCacheToCompute.reduce<
      Partial<AllFlatEntityMaps>
    >(
      (allFlatEntityMaps, metadataName) => ({
        ...allFlatEntityMaps,
        [getMetadataFlatEntityMapsKey(metadataName)]:
          createEmptyFlatEntityMaps(),
      }),
      {},
    );

    const twentyStandardApplicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        TWENTY_STANDARD_APPLICATION.universalIdentifier
      ];

    const applicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        applicationUniversalIdentifier
      ];

    if (!isDefined(twentyStandardApplicationId) || !isDefined(applicationId)) {
      throw new FlatEntityMapsException(
        'Application to build and its dependent application not found',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    const isBuildingTwentyStandardApplication =
      applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier;

    const dependencyAllFlatEntityMaps = allMetadataNameCacheToCompute.reduce(
      (allFlatEntityMaps, metadataName) => {
        const metadataFlatEntityMapsKey =
          getMetadataFlatEntityMapsKey(metadataName);

        return {
          ...allFlatEntityMaps,
          [metadataFlatEntityMapsKey]:
            getSubFlatEntityMapsByApplicationIdsOrThrow<
              MetadataFlatEntity<typeof metadataName>
            >({
              applicationIds: isBuildingTwentyStandardApplication
                ? [applicationId]
                : [applicationId, twentyStandardApplicationId],
              flatEntityMaps:
                allRelatedFlatEntityMaps[metadataFlatEntityMapsKey],
            }),
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
    fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps;
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

    const fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps = {};
    const idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName =
      {};
    const inferDeletionFromMissingEntities: InferDeletionFromMissingEntities =
      {};
    const allMetadataNameToCompare = Object.keys(
      allFlatEntityOperationByMetadataName,
    ) as AllMetadataName[];

    for (const metadataName of allMetadataNameToCompare) {
      const flatEntityOperations =
        allFlatEntityOperationByMetadataName[metadataName];

      if (!isDefined(flatEntityOperations)) {
        throw new FlatEntityMapsException(
          `Could not load flat entity maps to compare for ${metadataName}, should never occur`,
          FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR,
        );
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
        computeUniversalFlatEntityMapsFromToThroughMutation({
          flatEntityMaps: structuredClone(flatEntityMaps),
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
  ): Promise<
    | WorkspaceMigrationOrchestratorFailedResult
    | WorkspaceMigrationOrchestratorSuccessfulResult
  > {
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

    const workspaceMigration = isDefined(idByUniversalIdentifierByMetadataName)
      ? enrichCreateWorkspaceMigrationActionsWithIds({
          idByUniversalIdentifierByMetadataName,
          workspaceMigration: validateAndBuildResult.workspaceMigration,
        })
      : validateAndBuildResult.workspaceMigration;

    if (workspaceMigration.actions.length > 0) {
      const { metadataEvents } = await this.workspaceMigrationRunnerService.run(
        {
          workspaceId: args.workspaceId,
          workspaceMigration,
        },
      );

      this.metadataEventEmitter.emitMetadataEvents({
        metadataEvents,
        workspaceId: args.workspaceId,
      });
    }

    return {
      status: 'success',
      workspaceMigration,
    };
  }

  public async validateBuildAndRunWorkspaceMigration({
    allFlatEntityOperationByMetadataName: allFlatEntities,
    workspaceId,
    isSystemBuild = false,
    applicationUniversalIdentifier,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<
    | WorkspaceMigrationOrchestratorFailedResult
    | WorkspaceMigrationOrchestratorSuccessfulResult
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
      buildOptions: {
        isSystemBuild,
        inferDeletionFromMissingEntities,
        applicationUniversalIdentifier,
      },
      fromToAllFlatEntityMaps,
      workspaceId,
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
      idByUniversalIdentifierByMetadataName,
    });
  }
}
