import { Inject } from '@nestjs/common';

import { type AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import { WORKSPACE_MIGRATION_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/workspace-migration-duration-ms-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { AllUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/all-universal-flat-entity-maps.type';
import { MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { UniversalFlatEntityDiff } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-diff.type';
import { UniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteUniversalFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-foreign-key-aggregators.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-flat-entity-foreign-key-aggregators.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';
import { replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/replace-universal-flat-entity-in-universal-flat-entity-maps-through-mutation-or-throw.util';
import { resetUniversalFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { flatEntityDeletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/universal-flat-entity-deleted-created-updated-matrix-dispatcher.util';
import { getMetadataEmptyWorkspaceMigrationActionRecord } from 'src/engine/workspace-manager/workspace-migration/utils/get-metadata-empty-workspace-migration-action-record.util';
import { shouldInferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/utils/should-infer-deletion-from-missing-entities.util';
import { topologicallySortUniversalFlatEntitiesForSelfReferentialFks } from 'src/engine/workspace-manager/workspace-migration/utils/topologically-sort-universal-flat-entities-for-self-referential-fks.util';
import { FlatEntityValidationError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/types/failed-flat-entity-validation.type';
import { FailedFlatEntityValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/failed-flat-entity-validate-and-build.type';
import { SuccessfulFlatEntityValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/successful-flat-entity-validate-and-build.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export type ValidateAndBuildArgs<T extends AllMetadataName> = {
  buildOptions: WorkspaceMigrationBuilderOptions;
  dependencyOptimisticFlatEntityMaps: AllUniversalFlatEntityMaps;
  workspaceId: string;
  additionalCacheDataMaps: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
} & FromTo<MetadataUniversalFlatEntityMaps<T>>;

export type ValidateAndBuildReturnType<T extends AllMetadataName> = Promise<
  SuccessfulFlatEntityValidateAndBuild<T> | FailedFlatEntityValidateAndBuild<T>
>;

export abstract class WorkspaceEntityMigrationBuilderService<
  T extends AllMetadataName,
> {
  @Inject(LoggerService)
  protected readonly logger: LoggerService;

  @Inject(MetricsService)
  protected readonly metricsService: MetricsService;

  private metadataName: T;

  constructor(metadataName: T) {
    this.metadataName = metadataName;
  }

  public async validateAndBuild({
    buildOptions,
    dependencyOptimisticFlatEntityMaps:
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    from: fromFlatEntityMaps,
    to: toFlatEntityMaps,
    additionalCacheDataMaps,
    workspaceId,
  }: ValidateAndBuildArgs<T>): ValidateAndBuildReturnType<T> {
    this.logger.perfTime(
      `EntityBuilder ${this.metadataName}`,
      'validateAndBuild',
    );
    this.logger.perfTime(
      `EntityBuilder ${this.metadataName}`,
      'matrix computation',
    );

    const validateAndBuildStart = performance.now();
    const matrixComputationStart = performance.now();

    const fromFlatEntities = Object.values(
      fromFlatEntityMaps.byUniversalIdentifier,
    ).filter(isDefined);
    const toFlatEntities = Object.values(
      toFlatEntityMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const {
      createdFlatEntityMaps,
      deletedFlatEntityMaps,
      updatedFlatEntityMaps,
    } = flatEntityDeletedCreatedUpdatedMatrixDispatcher<T>({
      from: fromFlatEntities,
      to: toFlatEntities,
      metadataName: this.metadataName,
      buildOptions,
    });

    this.logger.perfTimeEnd(
      `EntityBuilder ${this.metadataName}`,
      'matrix computation',
    );
    this.logger.perfTime(
      `EntityBuilder ${this.metadataName}`,
      'entity processing',
    );

    this.recordBuildEntityPhaseMetric({
      phase: 'matrix-computation',
      startedAt: matrixComputationStart,
    });

    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(this.metadataName);
    const actionsResult = getMetadataEmptyWorkspaceMigrationActionRecord(
      this.metadataName,
    );
    const allValidationResult: FailedFlatEntityValidateAndBuild<T>['errors'] =
      [];

    this.logger.perfTime(
      `EntityBuilder ${this.metadataName}`,
      'deletion validation',
    );

    const deletionValidationStart = performance.now();

    const remainingFlatEntityMapsToDelete = structuredClone(
      deletedFlatEntityMaps,
    );

    const universalIdentifiersToDelete = shouldInferDeletionFromMissingEntities(
      {
        buildOptions,
        metadataName: this.metadataName,
      },
    )
      ? Object.keys(deletedFlatEntityMaps.byUniversalIdentifier)
      : [];

    for (const universalIdentifierToDelete of universalIdentifiersToDelete) {
      deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalIdentifierToDelete,
          universalFlatEntityMapsToMutate: remainingFlatEntityMapsToDelete,
        },
      );

      const universalFlatEntityToDelete =
        findFlatEntityByUniversalIdentifierOrThrow({
          universalIdentifier: universalIdentifierToDelete,
          flatEntityMaps: deletedFlatEntityMaps,
        });

      const validationResult = await this.validateFlatEntityDeletion({
        flatEntityToValidate: universalFlatEntityToDelete,
        workspaceId,
        remainingFlatEntityMapsToValidate: remainingFlatEntityMapsToDelete,
        buildOptions,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        additionalCacheDataMaps,
      });

      if (validationResult.status === 'fail') {
        allValidationResult.push(validationResult);
        continue;
      }

      deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          universalFlatEntity: universalFlatEntityToDelete,
          universalFlatEntityAndRelatedMapsToMutate:
            optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
          metadataName: this.metadataName,
        },
      );

      const universalFlatEntityToDeletePayload =
        deleteFlatEntityForeignKeyAggregators({
          metadataName: this.metadataName,
          universalFlatEntity: universalFlatEntityToDelete,
        });

      actionsResult.delete.push(
        ...(Array.isArray(validationResult.action)
          ? validationResult.action
          : [validationResult.action]
        ).map((action) => ({
          ...action,
          flatEntity: universalFlatEntityToDeletePayload,
        })),
      );
    }

    this.logger.perfTimeEnd(
      `EntityBuilder ${this.metadataName}`,
      'deletion validation',
    );
    this.logger.perfTime(
      `EntityBuilder ${this.metadataName}`,
      'creation validation',
    );

    this.recordBuildEntityPhaseMetric({
      phase: 'deletion-validation',
      startedAt: deletionValidationStart,
    });

    const creationValidationStart = performance.now();

    const remainingFlatEntityMapsToCreate = structuredClone(
      createdFlatEntityMaps,
    );

    const sortedCreateUniversalIdentifiers =
      topologicallySortUniversalFlatEntitiesForSelfReferentialFks({
        metadataName: this.metadataName,
        universalFlatEntityMaps: createdFlatEntityMaps,
      });

    for (const flatEntityToCreateUniversalIdentifier of sortedCreateUniversalIdentifiers) {
      const rawUniversalflatEntityToCreate =
        findFlatEntityByUniversalIdentifierOrThrow({
          universalIdentifier: flatEntityToCreateUniversalIdentifier,
          flatEntityMaps: createdFlatEntityMaps,
        });

      const universalFlatEntityToCreate =
        resetUniversalFlatEntityForeignKeyAggregators({
          metadataName: this.metadataName,
          universalFlatEntity: rawUniversalflatEntityToCreate,
        });

      const universalIdentifierToDelete =
        universalFlatEntityToCreate.universalIdentifier;

      deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalIdentifierToDelete,
          universalFlatEntityMapsToMutate: remainingFlatEntityMapsToCreate,
        },
      );

      const validationResult = await this.innerValidateFlatEntityCreation({
        additionalCacheDataMaps,
        flatEntityToValidate: universalFlatEntityToCreate,
        workspaceId,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        remainingFlatEntityMapsToValidate: remainingFlatEntityMapsToCreate,
        buildOptions,
      });

      if (validationResult.status === 'fail') {
        allValidationResult.push(validationResult);
        continue;
      }

      addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow(
        {
          universalFlatEntity: universalFlatEntityToCreate,
          universalFlatEntityAndRelatedMapsToMutate:
            optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
          metadataName: this.metadataName,
        },
      );

      const formattedNewCreateAction: AllUniversalWorkspaceMigrationAction<
        'create',
        typeof this.metadataName
      > = {
        ...validationResult.action,
        flatEntity: deleteUniversalFlatEntityForeignKeyAggregators({
          metadataName: this.metadataName,
          universalFlatEntity: validationResult.action
            .flatEntity as MetadataFlatEntity<T>,
        }),
      };

      actionsResult.create.push(formattedNewCreateAction);
    }

    this.logger.perfTimeEnd(
      `EntityBuilder ${this.metadataName}`,
      'creation validation',
    );
    this.logger.perfTime(
      `EntityBuilder ${this.metadataName}`,
      'update validation',
    );

    this.recordBuildEntityPhaseMetric({
      phase: 'creation-validation',
      startedAt: creationValidationStart,
    });

    const updateValidationStart = performance.now();

    for (const flatEntityToUpdateUniversalIdentifier in updatedFlatEntityMaps.byUniversalIdentifier) {
      const flatEntityUpdate =
        updatedFlatEntityMaps.byUniversalIdentifier[
          flatEntityToUpdateUniversalIdentifier
        ];

      if (!isDefined(flatEntityUpdate)) {
        throw new FlatEntityMapsException(
          'Could not find flat entity updates in maps dispatcher should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const validationResult = await this.validateFlatEntityUpdate({
        flatEntityUpdate: flatEntityUpdate.update,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        workspaceId,
        buildOptions,
        additionalCacheDataMaps,
        universalIdentifier: flatEntityToUpdateUniversalIdentifier,
      });

      if (validationResult.status === 'fail') {
        allValidationResult.push(validationResult);
        continue;
      }

      const existingFlatEntity = findFlatEntityByUniversalIdentifier<
        MetadataUniversalFlatEntity<T>
      >({
        universalIdentifier: flatEntityToUpdateUniversalIdentifier,
        flatEntityMaps:
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps[flatEntityMapsKey],
      });

      if (!isDefined(existingFlatEntity)) {
        throw new FlatEntityMapsException(
          'Existing flat entity to update post successful validation is not defined, should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const updatedFlatEntity: MetadataUniversalFlatEntity<T> = {
        ...existingFlatEntity,
        ...flatEntityUpdate.update,
      };

      const diff = Object.fromEntries(
        Object.entries(flatEntityUpdate.update).map(([key, after]) => [
          key,
          {
            before:
              existingFlatEntity[key as keyof MetadataUniversalFlatEntity<T>],
            after,
          },
        ]),
      ) as UniversalFlatEntityDiff<T>;

      replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow(
        {
          universalFlatEntity: updatedFlatEntity,
          universalFlatEntityMapsToMutate:
            optimisticFlatEntityMapsAndRelatedFlatEntityMaps[flatEntityMapsKey],
        },
      );

      actionsResult.update.push(
        ...(Array.isArray(validationResult.action)
          ? validationResult.action
          : [validationResult.action]
        ).map((action) => ({
          ...action,
          flatEntity: updatedFlatEntity,
          diff,
        })),
      );
    }

    this.logger.perfTimeEnd(
      `EntityBuilder ${this.metadataName}`,
      'update validation',
    );
    this.logger.perfTimeEnd(
      `EntityBuilder ${this.metadataName}`,
      'entity processing',
    );

    this.recordBuildEntityPhaseMetric({
      phase: 'update-validation',
      startedAt: updateValidationStart,
    });

    if (allValidationResult.length > 0) {
      this.recordBuildEntityDurationMetric({
        status: 'fail',
        startedAt: validateAndBuildStart,
      });

      return {
        status: 'fail',
        errors: allValidationResult,
      };
    }

    this.recordBuildEntityDurationMetric({
      status: 'success',
      startedAt: validateAndBuildStart,
    });

    this.logger.perfTimeEnd(
      `EntityBuilder ${this.metadataName}`,
      'validateAndBuild',
    );

    return {
      status: 'success',
      actions: actionsResult,
    };
  }

  private recordBuildEntityDurationMetric({
    status,
    startedAt,
  }: {
    status: 'success' | 'fail';
    startedAt: number;
  }): void {
    this.metricsService.recordHistogram({
      key: MetricsKeys.WorkspaceMigrationBuildEntityDurationMs,
      value: performance.now() - startedAt,
      unit: 'ms',
      attributes: { metadataName: this.metadataName, status },
      bucketBoundaries: WORKSPACE_MIGRATION_DURATION_MS_BUCKET_BOUNDARIES,
    });
  }

  private recordBuildEntityPhaseMetric({
    phase,
    startedAt,
  }: {
    phase: string;
    startedAt: number;
  }): void {
    this.metricsService.recordHistogram({
      key: MetricsKeys.WorkspaceMigrationBuildEntityPhaseDurationMs,
      value: performance.now() - startedAt,
      unit: 'ms',
      attributes: { metadataName: this.metadataName, phase },
      bucketBoundaries: WORKSPACE_MIGRATION_DURATION_MS_BUCKET_BOUNDARIES,
    });
  }

  private validateUniversalIdentifier({
    flatEntityToValidate: { universalIdentifier },
  }: UniversalFlatEntityValidationArgs<T>): FlatEntityValidationError[] {
    if (
      !uuidValidate(universalIdentifier) ||
      uuidVersion(universalIdentifier) < 4
    ) {
      return [
        {
          code: FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
          message: `Invalid universalIdentifier: "${universalIdentifier}" is not a valid UUID, uuid version should be greater than 4`,
          value: universalIdentifier,
        },
      ];
    }

    if (universalIdentifier !== universalIdentifier.toLowerCase()) {
      return [
        {
          code: FlatEntityMapsExceptionCode.ENTITY_MALFORMED,
          message: `Invalid universalIdentifier: "${universalIdentifier}" must be lowercase`,
          value: universalIdentifier,
        },
      ];
    }

    return [];
  }

  private validateUniversalIdentifierNotAlreadyInCurrentMetadataMaps({
    universalIdentifier,
    universalFlatEntityMaps,
  }: {
    universalFlatEntityMaps: UniversalFlatEntityMaps<
      MetadataFlatEntity<typeof this.metadataName>
    >;
    universalIdentifier: string;
  }): FlatEntityValidationError[] {
    const existingEntity = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: universalFlatEntityMaps,
      universalIdentifier,
    });

    if (isDefined(existingEntity)) {
      return [
        {
          code: FlatEntityMapsExceptionCode.ENTITY_ALREADY_EXISTS,
          message: `Cannot create ${this.metadataName}: universalIdentifier "${universalIdentifier}" already exists in ${this.metadataName} maps from application "${existingEntity.applicationUniversalIdentifier}"`,
        },
      ];
    }

    return [];
  }

  private async innerValidateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<T>,
  ): Promise<UniversalFlatEntityValidationReturnType<T, 'create'>> {
    const uuidValidationResult = this.validateUniversalIdentifier(args);
    const perTypeExistenceResult =
      this.validateUniversalIdentifierNotAlreadyInCurrentMetadataMaps({
        universalIdentifier: args.flatEntityToValidate.universalIdentifier,
        universalFlatEntityMaps:
          args.optimisticFlatEntityMapsAndRelatedFlatEntityMaps[
            getMetadataFlatEntityMapsKey(this.metadataName)
          ],
      });

    const centralizedErrors = [
      ...uuidValidationResult,
      ...perTypeExistenceResult,
    ];

    const result = await this.validateFlatEntityCreation(args);

    if (result.status === 'fail') {
      return {
        ...result,
        errors: [...result.errors, ...centralizedErrors],
      };
    }

    if (result.status === 'success' && centralizedErrors.length > 0) {
      return {
        status: 'fail',
        flatEntityMinimalInformation: {
          universalIdentifier: args.flatEntityToValidate.universalIdentifier,
        } as Partial<MetadataFlatEntity<T>>,
        errors: centralizedErrors,
        metadataName: this.metadataName,
        type: 'create',
      };
    }

    return result;
  }

  protected abstract validateFlatEntityCreation(
    args: UniversalFlatEntityValidationArgs<T>,
  ):
    | UniversalFlatEntityValidationReturnType<T, 'create'>
    | Promise<UniversalFlatEntityValidationReturnType<T, 'create'>>;

  protected abstract validateFlatEntityDeletion(
    args: UniversalFlatEntityValidationArgs<T>,
  ):
    | UniversalFlatEntityValidationReturnType<T, 'delete'>
    | Promise<UniversalFlatEntityValidationReturnType<T, 'delete'>>;

  protected abstract validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<T>,
  ):
    | UniversalFlatEntityValidationReturnType<T, 'update'>
    | Promise<UniversalFlatEntityValidationReturnType<T, 'update'>>;
}
