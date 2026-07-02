import { Injectable } from '@nestjs/common';

import {
  AllMetadataName,
  WorkspaceMigrationV2ExceptionCode,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { AllFlatEntityOperationByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-to-create-delete-update.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getFlatEntityMapsExceptionContext } from 'src/engine/metadata-modules/flat-entity/utils/get-flat-entity-maps-exception-context.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import { getSubAllFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-all-flat-entity-maps-by-application-ids-or-throw.util';
import { transpileFlatEntityOperationArrayToRecord } from 'src/engine/metadata-modules/flat-entity/utils/transpile-flat-entity-operation-array-to-record.util';
import { MetadataSideEffectEngineService } from 'src/engine/metadata-modules/metadata-side-effect/services/metadata-side-effect-engine.service';
import { MetadataEventEmitter } from 'src/engine/subscriptions/metadata-event/metadata-event-emitter';
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
  allFlatEntityOperationByMetadataName: AllFlatEntityOperationByMetadataName;
  isSystemBuild?: boolean;
  applicationUniversalIdentifier: string;
  dryRun?: boolean;
};

type ValidateBuildAndRunWorkspaceMigrationFromRecordArgs = {
  workspaceId: string;
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  isSystemBuild?: boolean;
  applicationUniversalIdentifier: string;
  dryRun?: boolean;
};

@Injectable()
export class WorkspaceMigrationValidateBuildAndRunService {
  private readonly isDebugEnabled: boolean;

  constructor(
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
    private readonly workspaceMigrationBuildOrchestratorService: WorkspaceMigrationBuildOrchestratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metadataEventEmitter: MetadataEventEmitter,
    private readonly metadataSideEffectEngineService: MetadataSideEffectEngineService,
    private readonly logger: LoggerService,
    twentyConfigService: TwentyConfigService,
  ) {
    const logLevels = twentyConfigService.get('LOG_LEVELS');

    this.isDebugEnabled = logLevels.includes('debug');
  }

  private computeAllInvolvedApplicationIds({
    allFlatEntityOperationRecordByMetadataName,
    flatApplicationMaps,
    applicationUniversalIdentifier,
    allRelatedFlatEntityMaps,
  }: Pick<
    ValidateBuildAndRunWorkspaceMigrationFromRecordArgs,
    | 'allFlatEntityOperationRecordByMetadataName'
    | 'applicationUniversalIdentifier'
  > & {
    flatApplicationMaps: FlatApplicationCacheMaps;
    allRelatedFlatEntityMaps: Partial<AllFlatEntityMaps>;
  }): string[] {
    const applicationIds = new Set<string>();

    const applicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        applicationUniversalIdentifier
      ];

    const twentyStandardApplicationId =
      flatApplicationMaps.idByUniversalIdentifier[
        TWENTY_STANDARD_APPLICATION.universalIdentifier
      ];

    if (!isDefined(twentyStandardApplicationId) || !isDefined(applicationId)) {
      throw new FlatEntityMapsException(
        'Application to build and its dependent application not found',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    applicationIds.add(applicationId);

    const isBuildingTwentyStandardApplication =
      applicationUniversalIdentifier ===
      TWENTY_STANDARD_APPLICATION.universalIdentifier;

    if (!isBuildingTwentyStandardApplication) {
      applicationIds.add(twentyStandardApplicationId);
    }

    for (const metadataName of Object.keys(
      allFlatEntityOperationRecordByMetadataName,
    ) as AllMetadataName[]) {
      const flatEntityOperations =
        allFlatEntityOperationRecordByMetadataName[metadataName];

      if (!isDefined(flatEntityOperations)) {
        continue;
      }

      const { flatEntityToCreate, flatEntityToUpdate, flatEntityToDelete } =
        flatEntityOperations;

      const relations = ALL_MANY_TO_ONE_METADATA_RELATIONS[metadataName];

      for (const flatEntity of [
        ...Object.values(flatEntityToCreate),
        ...Object.values(flatEntityToUpdate),
        ...Object.values(flatEntityToDelete),
      ]) {
        const entityApplicationId =
          flatApplicationMaps.idByUniversalIdentifier[
            flatEntity.applicationUniversalIdentifier
          ];

        if (isDefined(entityApplicationId)) {
          applicationIds.add(entityApplicationId);
        }

        for (const relation of Object.values(relations) as ({
          foreignKey: string;
          metadataName: AllMetadataName;
          isNullable: boolean;
          universalForeignKey: string;
        } | null)[]) {
          if (!isDefined(relation)) {
            continue;
          }

          const { universalForeignKey, metadataName: targetMetadataName } =
            relation;

          const referencedUniversalIdentifier =
            flatEntity[universalForeignKey as keyof typeof flatEntity];

          if (!isDefined(referencedUniversalIdentifier)) {
            continue;
          }

          const targetFlatEntityMaps =
            allRelatedFlatEntityMaps[
              getMetadataFlatEntityMapsKey(
                targetMetadataName as AllMetadataName,
              )
            ];

          if (!isDefined(targetFlatEntityMaps)) {
            continue;
          }

          const referencedEntity =
            targetFlatEntityMaps.byUniversalIdentifier[
              referencedUniversalIdentifier
            ];

          if (isDefined(referencedEntity)) {
            applicationIds.add(referencedEntity.applicationId);
          }
        }
      }
    }

    return [...applicationIds];
  }

  private async computeAllRelatedFlatEntityMaps({
    allFlatEntityOperationRecordByMetadataName,
    workspaceId,
    applicationUniversalIdentifier,
  }: ValidateBuildAndRunWorkspaceMigrationFromRecordArgs) {
    const allMetadataNameToCompare = Object.keys(
      allFlatEntityOperationRecordByMetadataName,
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

    const applicationIds = this.computeAllInvolvedApplicationIds({
      allFlatEntityOperationRecordByMetadataName,
      flatApplicationMaps,
      applicationUniversalIdentifier,
      allRelatedFlatEntityMaps,
    });

    const dependencyAllFlatEntityMaps =
      getSubAllFlatEntityMapsByApplicationIdsOrThrow({
        applicationIds,
        metadataNames: allMetadataNameCacheToCompute,
        fromAllFlatEntityMaps: allRelatedFlatEntityMaps,
      });

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
    allFlatEntityOperationRecordByMetadataName,
    workspaceId,
    applicationUniversalIdentifier,
  }: ValidateBuildAndRunWorkspaceMigrationFromRecordArgs): Promise<{
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
      allFlatEntityOperationRecordByMetadataName,
      workspaceId,
      applicationUniversalIdentifier,
    });

    const fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps = {};
    const idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName =
      {};
    const inferDeletionFromMissingEntities: InferDeletionFromMissingEntities =
      {};
    const allMetadataNameToCompare = Object.keys(
      allFlatEntityOperationRecordByMetadataName,
    ) as AllMetadataName[];

    for (const metadataName of allMetadataNameToCompare) {
      const flatEntityOperations =
        allFlatEntityOperationRecordByMetadataName[metadataName];

      if (!isDefined(flatEntityOperations)) {
        throw new FlatEntityMapsException(
          `Could not load flat entity maps to compare for ${metadataName}, should never occur`,
          FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

      // The record matrix is the canonical form; the from/to mutation helper still
      // consumes arrays, so we flatten each bucket at this boundary only.
      const flatEntityToCreate = Object.values(
        flatEntityOperations.flatEntityToCreate,
      );
      const flatEntityToUpdate = Object.values(
        flatEntityOperations.flatEntityToUpdate,
      );
      const flatEntityToDelete = Object.values(
        flatEntityOperations.flatEntityToDelete,
      );

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
      dryRun?: boolean;
    },
  ): Promise<
    | WorkspaceMigrationOrchestratorFailedResult
    | (WorkspaceMigrationOrchestratorSuccessfulResult & {
        hasSchemaMetadataChanged: boolean;
      })
  > {
    const { idByUniversalIdentifierByMetadataName, dryRun, ...buildArgs } =
      args;

    const buildStart = performance.now();
    const validateAndBuildResult =
      await this.workspaceMigrationBuildOrchestratorService
        .buildWorkspaceMigration(buildArgs)
        .catch((error) => {
          this.logger.error(
            error,
            WorkspaceMigrationValidateBuildAndRunService.name,
          );
          throw new WorkspaceMigrationV2Exception(
            error.message,
            WorkspaceMigrationV2ExceptionCode.BUILDER_INTERNAL_SERVER_ERROR,
            { context: getFlatEntityMapsExceptionContext(error) },
          );
        });
    const buildMs = performance.now() - buildStart;

    this.logger.perf(
      `[install-perf] buildWorkspaceMigration took ${buildMs.toFixed(1)}ms (status=${validateAndBuildResult.status})`,
      WorkspaceMigrationValidateBuildAndRunService.name,
    );

    if (validateAndBuildResult.status === 'fail') {
      if (this.isDebugEnabled) {
        this.logger.debug?.(
          JSON.stringify(validateAndBuildResult, null, 2),
          WorkspaceMigrationValidateBuildAndRunService.name,
        );
      }

      return validateAndBuildResult;
    }

    const workspaceMigration = enrichCreateWorkspaceMigrationActionsWithIds({
      idByUniversalIdentifierByMetadataName:
        idByUniversalIdentifierByMetadataName ?? {},
      workspaceMigration: validateAndBuildResult.workspaceMigration,
    });

    if (dryRun === true || workspaceMigration.actions.length === 0) {
      return {
        status: 'success',
        workspaceMigration,
        hasSchemaMetadataChanged: false,
      };
    }

    const actionCountsByTypeAndMetadataName: Record<string, number> = {};

    for (const action of workspaceMigration.actions) {
      const key = `${action.type}:${action.metadataName}`;

      actionCountsByTypeAndMetadataName[key] =
        (actionCountsByTypeAndMetadataName[key] ?? 0) + 1;
    }

    this.logger.perf(
      `[install-perf] validateBuildAndRunWorkspaceMigrationFromTo running ${workspaceMigration.actions.length} actions: ${JSON.stringify(actionCountsByTypeAndMetadataName)}`,
      WorkspaceMigrationValidateBuildAndRunService.name,
    );

    const runStart = performance.now();
    const { hasSchemaMetadataChanged, metadataEvents } =
      await this.workspaceMigrationRunnerService.run({
        workspaceId: args.workspaceId,
        workspaceMigration,
      });
    const runMs = performance.now() - runStart;

    this.logger.perf(
      `[install-perf] workspaceMigrationRunnerService.run took ${runMs.toFixed(1)}ms for ${workspaceMigration.actions.length} actions`,
      WorkspaceMigrationValidateBuildAndRunService.name,
    );

    this.metadataEventEmitter.emitMetadataEvents({
      metadataEvents: metadataEvents,
      workspaceId: args.workspaceId,
    });

    return {
      status: 'success',
      workspaceMigration,
      hasSchemaMetadataChanged,
    };
  }

  public async validateBuildAndRunWorkspaceMigration({
    allFlatEntityOperationByMetadataName,
    workspaceId,
    isSystemBuild = false,
    applicationUniversalIdentifier,
    dryRun,
  }: ValidateBuildAndRunWorkspaceMigrationFromMatriceArgs): Promise<
    | WorkspaceMigrationOrchestratorFailedResult
    | (WorkspaceMigrationOrchestratorSuccessfulResult & {
        hasSchemaMetadataChanged: boolean;
      })
  > {
    return await this.validateBuildAndRunWorkspaceMigrationFromRecord({
      allFlatEntityOperationRecordByMetadataName:
        transpileFlatEntityOperationArrayToRecord(
          allFlatEntityOperationByMetadataName,
        ),
      workspaceId,
      isSystemBuild,
      applicationUniversalIdentifier,
      dryRun,
    });
  }

  public async validateBuildAndRunWorkspaceMigrationFromRecord({
    allFlatEntityOperationRecordByMetadataName,
    workspaceId,
    isSystemBuild = false,
    applicationUniversalIdentifier,
    dryRun,
  }: ValidateBuildAndRunWorkspaceMigrationFromRecordArgs): Promise<
    | WorkspaceMigrationOrchestratorFailedResult
    | (WorkspaceMigrationOrchestratorSuccessfulResult & {
        hasSchemaMetadataChanged: boolean;
      })
  > {
    const sideEffectRelatedFlatEntityMaps: Partial<AllFlatEntityMaps> =
      await this.workspaceCacheService.getOrRecompute(
        workspaceId,
        this.metadataSideEffectEngineService.getRequiredFlatEntityMapsCacheKeys(),
      );

    const sideEffectExpansionResult =
      this.metadataSideEffectEngineService.expandWithSideEffects({
        allFlatEntityOperationRecordByMetadataName,
        sideEffectRelatedFlatEntityMaps,
        context: {
          buildOptions: { isSystemBuild, applicationUniversalIdentifier },
        },
      });

    if (sideEffectExpansionResult.status === 'fail') {
      return sideEffectExpansionResult;
    }

    const expandedAllFlatEntityOperationRecordByMetadataName =
      sideEffectExpansionResult.allFlatEntityOperationRecordByMetadataName;

    const {
      fromToAllFlatEntityMaps,
      inferDeletionFromMissingEntities,
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
      idByUniversalIdentifierByMetadataName,
    } = await this.computeFromToAllFlatEntityMapsAndBuildOptions({
      allFlatEntityOperationRecordByMetadataName:
        expandedAllFlatEntityOperationRecordByMetadataName,
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
      dryRun,
    });
  }
}
