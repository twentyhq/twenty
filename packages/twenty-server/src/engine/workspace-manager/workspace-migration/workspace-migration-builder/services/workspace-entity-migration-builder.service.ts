import { Inject } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { MetadataFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity.type';
import { MetadataValidationRelatedUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { MetadataUniversalFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/metadata-universal-flat-entity.type';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration/types/workspace-migration-builder-additional-cache-data-maps.type';
import { MetadataUniversalFlatEntityMaps } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/metadata-universal-flat-entity-maps.type';
import { addUniversalFlatEntityToUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/add-universal-flat-entity-to-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteUniversalFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-foreign-key-aggregators.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteUniversalFlatEntityFromUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/delete-universal-flat-entity-from-universal-flat-entity-maps-through-mutation-or-throw.util';
import { replaceUniversalFlatEntityInUniversalFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/replace-universal-flat-entity-in-universal-flat-entity-maps-through-mutation-or-throw.util';
import { resetUniversalFlatEntityForeignKeyAggregators } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/reset-universal-flat-entity-foreign-key-aggregators.util';
import { flatEntityDeletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/universal-flat-entity-deleted-created-updated-matrix-dispatcher.util';
import { getMetadataEmptyWorkspaceMigrationActionRecord } from 'src/engine/workspace-manager/workspace-migration/utils/get-metadata-empty-workspace-migration-action-record.util';
import { shouldInferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration/utils/should-infer-deletion-from-missing-entities.util';
import { FailedFlatEntityValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/failed-flat-entity-validate-and-build.type';
import { SuccessfulFlatEntityValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/successful-flat-entity-validate-and-build.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-update-validation-args.type';
import { UniversalFlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-args.type';
import { UniversalFlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/universal-flat-entity-validation-result.type';
import { AllUniversalWorkspaceMigrationAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-action-common';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/types/workspace-migration-builder-options.type';

export type ValidateAndBuildArgs<T extends AllMetadataName> = {
  buildOptions: WorkspaceMigrationBuilderOptions;
  dependencyOptimisticFlatEntityMaps: MetadataValidationRelatedUniversalFlatEntityMaps<T>;
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
  private metadataName: T;

  constructor(metadataName: T) {
    this.metadataName = metadataName;
  }

  public async validateAndBuild({
    buildOptions,
    dependencyOptimisticFlatEntityMaps: inputDependencyOptimisticFlatEntityMaps,
    from: fromFlatEntityMaps,
    to: toFlatEntityMaps,
    additionalCacheDataMaps,
    workspaceId,
  }: ValidateAndBuildArgs<T>): ValidateAndBuildReturnType<T> {
    this.logger.time(`EntityBuilder ${this.metadataName}`, 'validateAndBuild');
    this.logger.time(
      `EntityBuilder ${this.metadataName}`,
      'matrix computation',
    );

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

    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'matrix computation',
    );
    this.logger.time(`EntityBuilder ${this.metadataName}`, 'entity processing');

    const flatEntityMapsKey = getMetadataFlatEntityMapsKey(this.metadataName);
    const optimisticFlatEntityMapsAndRelatedFlatEntityMaps = {
      [flatEntityMapsKey]: structuredClone(fromFlatEntityMaps),
      ...structuredClone(inputDependencyOptimisticFlatEntityMaps),
    } as MetadataUniversalFlatEntityAndRelatedFlatEntityMapsForValidation<T>;

    const actionsResult = getMetadataEmptyWorkspaceMigrationActionRecord(
      this.metadataName,
    );
    const allValidationResult: FailedFlatEntityValidateAndBuild<T>['errors'] =
      [];
    const remainingFlatEntityMapsToCreate = structuredClone(
      createdFlatEntityMaps,
    );

    this.logger.time(
      `EntityBuilder ${this.metadataName}`,
      'creation validation',
    );
    for (const flatEntityToCreateUniversalIdentifier in createdFlatEntityMaps.byUniversalIdentifier) {
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

      const validationResult = await this.validateFlatEntityCreation({
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

    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'creation validation',
    );
    this.logger.time(
      `EntityBuilder ${this.metadataName}`,
      'deletion validation',
    );

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

      actionsResult.delete.push(
        ...(Array.isArray(validationResult.action)
          ? validationResult.action
          : [validationResult.action]),
      );
    }

    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'deletion validation',
    );
    this.logger.time(`EntityBuilder ${this.metadataName}`, 'update validation');

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
          : [validationResult.action]),
      );
    }

    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'update validation',
    );
    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'entity processing',
    );

    if (allValidationResult.length > 0) {
      return {
        status: 'fail',
        errors: allValidationResult,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      };
    }

    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'validateAndBuild',
    );

    return {
      status: 'success',
      actions: actionsResult,
      optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
    };
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
