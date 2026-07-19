import { Injectable } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { ALL_MANY_TO_ONE_METADATA_RELATIONS } from 'src/engine/metadata-modules/flat-entity/constant/all-many-to-one-metadata-relations.constant';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { AllFlatEntityOperationRecordByMetadataName } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-operation-record-by-metadata-name.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';
import { getSubAllFlatEntityMapsByApplicationIdsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/get-sub-all-flat-entity-maps-by-application-ids-or-throw.util';
import { MetadataSideEffectEngineService } from 'src/engine/metadata-modules/metadata-side-effect/services/metadata-side-effect-engine.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY } from 'src/engine/workspace-manager/workspace-migration/constant/workspace-migration-additional-cache-data-maps-key.constant';
import { IdByUniversalIdentifierByMetadataName } from 'src/engine/workspace-manager/workspace-migration/services/utils/enrich-create-workspace-migration-action-with-ids.util';
import { WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { FromToAllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-orchestrator.type';
import { computeUniversalFlatEntityMapsFromToThroughMutation } from 'src/engine/workspace-manager/workspace-migration/utils/compute-universal-flat-entity-maps-from-to-through-mutation.util';
import { InferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/infer-deletion-from-missing-entities.type';

export type WorkspaceMigrationRelatedFlatEntityMaps =
  Partial<AllFlatEntityMaps> & WorkspaceMigrationBuilderAdditionalCacheDataMaps;

export type FlatEntityMapsBundle = {
  flatApplicationMaps: FlatApplicationCacheMaps;
  allRelatedFlatEntityMaps: WorkspaceMigrationRelatedFlatEntityMaps;
  allMetadataNameCacheToCompute: AllMetadataName[];
};

type ComputeFromToAllFlatEntityMapsAndBuildOptionsArgs = {
  allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
  applicationUniversalIdentifier: string;
} & FlatEntityMapsBundle;

@Injectable()
export class WorkspaceMigrationFlatEntityMapsService {
  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly metadataSideEffectEngineService: MetadataSideEffectEngineService,
  ) {}

  async getOrRecomputeAllRelatedFlatEntityMaps({
    workspaceId,
    callerMetadataNames,
  }: {
    workspaceId: string;
    callerMetadataNames: AllMetadataName[];
  }): Promise<FlatEntityMapsBundle> {
    const allMetadataNameCacheToCompute = [
      ...new Set(
        [
          ...callerMetadataNames,
          ...this.metadataSideEffectEngineService.getSideEffectRelatedMetadataNames(
            callerMetadataNames,
          ),
        ].flatMap((metadataName) => [
          metadataName,
          ...getMetadataRelatedMetadataNamesForValidation(metadataName),
        ]),
      ),
    ];

    const { flatApplicationMaps, ...allRelatedFlatEntityMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        ...allMetadataNameCacheToCompute.map(getMetadataFlatEntityMapsKey),
        ...WORKSPACE_MIGRATION_ADDITIONAL_CACHE_DATA_MAPS_KEY,
        'flatApplicationMaps',
      ]);

    return {
      flatApplicationMaps,
      allRelatedFlatEntityMaps,
      allMetadataNameCacheToCompute,
    };
  }

  computeFromToAllFlatEntityMapsAndBuildOptions({
    allFlatEntityOperationRecordByMetadataName,
    applicationUniversalIdentifier,
    flatApplicationMaps,
    allRelatedFlatEntityMaps,
    allMetadataNameCacheToCompute,
  }: ComputeFromToAllFlatEntityMapsAndBuildOptionsArgs): {
    fromToAllFlatEntityMaps: FromToAllUniversalFlatEntityMaps;
    inferDeletionFromMissingEntities: InferDeletionFromMissingEntities;
    dependencyAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
    additionalCacheDataMaps: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
    idByUniversalIdentifierByMetadataName: IdByUniversalIdentifierByMetadataName;
  } {
    const { dependencyAllFlatEntityMaps, additionalCacheDataMaps } =
      this.computeDependencyAndAdditionalCacheDataMaps({
        allFlatEntityOperationRecordByMetadataName,
        applicationUniversalIdentifier,
        flatApplicationMaps,
        allRelatedFlatEntityMaps,
        allMetadataNameCacheToCompute,
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

      if (!isDefined(flatEntityMaps)) {
        throw new FlatEntityMapsException(
          `Flat entity maps for ${metadataName} were not pre-fetched; the up-front cache key union must cover every metadata name the side-effect expansion can add`,
          FlatEntityMapsExceptionCode.INTERNAL_SERVER_ERROR,
        );
      }

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

  private computeDependencyAndAdditionalCacheDataMaps({
    allFlatEntityOperationRecordByMetadataName,
    applicationUniversalIdentifier,
    flatApplicationMaps,
    allRelatedFlatEntityMaps,
    allMetadataNameCacheToCompute,
  }: ComputeFromToAllFlatEntityMapsAndBuildOptionsArgs) {
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
      dependencyAllFlatEntityMaps,
      additionalCacheDataMaps,
    };
  }

  private computeAllInvolvedApplicationIds({
    allFlatEntityOperationRecordByMetadataName,
    flatApplicationMaps,
    applicationUniversalIdentifier,
    allRelatedFlatEntityMaps,
  }: {
    allFlatEntityOperationRecordByMetadataName: AllFlatEntityOperationRecordByMetadataName;
    flatApplicationMaps: FlatApplicationCacheMaps;
    applicationUniversalIdentifier: string;
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

    if (!isDefined(twentyStandardApplicationId)) {
      throw new FlatEntityMapsException(
        'Twenty standard application not found in workspace',
        FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
      );
    }

    if (isDefined(applicationId)) {
      applicationIds.add(applicationId);
    }

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
}
