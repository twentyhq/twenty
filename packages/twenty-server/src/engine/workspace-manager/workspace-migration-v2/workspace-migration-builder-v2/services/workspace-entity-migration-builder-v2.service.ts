import { Inject } from '@nestjs/common';

import { AllMetadataName } from 'twenty-shared/metadata';
import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-entity/exceptions/flat-entity-maps.exception';
import { MetadataFlatEntityAndRelatedFlatEntityMapsForValidation } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-and-related-flat-entity-maps-for-validation.type';
import { MetadataFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-flat-entity-maps.type';
import { MetadataValidationRelatedFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/metadata-related-types.type';
import { addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/delete-flat-entity-from-flat-entity-and-related-entity-maps-through-mutation-or-throw.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceMigrationBuilderAdditionalCacheDataMaps } from 'src/engine/workspace-manager/workspace-migration-v2/types/workspace-migration-builder-additional-cache-data-maps.type';
import { deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/delete-flat-entity-from-flat-entity-maps-through-mutation-or-throw.util';
import { flatEntityDeletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-entity-deleted-created-updated-matrix-dispatcher.util';
import { getMetadataEmptyWorkspaceMigrationActionRecord } from 'src/engine/workspace-manager/workspace-migration-v2/utils/get-metadata-empty-workspace-migration-action-record.util';
import { replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration-v2/utils/replace-flat-entity-in-flat-entity-maps-through-mutation-or-throw.util';
import { shouldInferDeletionFromMissingEntities } from 'src/engine/workspace-manager/workspace-migration-v2/utils/should-infer-deletion-from-missing-entities.util';
import { FailedFlatEntityValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/failed-flat-entity-validate-and-build.type';
import { FlatEntityUpdateValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-update-validation-args.type';
import { FlatEntityValidationArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-args.type';
import { FlatEntityValidationReturnType } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/flat-entity-validation-result.type';
import { SuccessfulFlatEntityValidateAndBuild } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/successful-flat-entity-validate-and-build.type';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';
import { fromFlatEntityPropertiesUpdatesToPartialFlatEntity } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-runner-v2/utils/from-flat-entity-properties-updates-to-partial-flat-entity';

export type ValidateAndBuildArgs<T extends AllMetadataName> = {
  buildOptions: WorkspaceMigrationBuilderOptions;
  dependencyOptimisticFlatEntityMaps: MetadataValidationRelatedFlatEntityMaps<T>;
  workspaceId: string;
  additionalCacheDataMaps: WorkspaceMigrationBuilderAdditionalCacheDataMaps;
} & FromTo<MetadataFlatEntityMaps<T>>;

export type ValidateAndBuildReturnType<T extends AllMetadataName> = Promise<
  SuccessfulFlatEntityValidateAndBuild<T> | FailedFlatEntityValidateAndBuild<T>
>;

export abstract class WorkspaceEntityMigrationBuilderV2Service<
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
    workspaceId,
  }: ValidateAndBuildArgs<T>): ValidateAndBuildReturnType<T> {
    this.logger.time(`EntityBuilder ${this.metadataName}`, 'validateAndBuild');
    this.logger.time(
      `EntityBuilder ${this.metadataName}`,
      'matrix computation',
    );

    const fromFlatEntities = Object.values(fromFlatEntityMaps.byId).filter(
      isDefined,
    );
    const toFlatEntities = Object.values(toFlatEntityMaps.byId).filter(
      isDefined,
    );

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
    } as MetadataFlatEntityAndRelatedFlatEntityMapsForValidation<T>;

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
    for (const flatEntityToCreateId in createdFlatEntityMaps.byId) {
      const flatEntityToCreate =
        createdFlatEntityMaps.byId[flatEntityToCreateId];

      if (!isDefined(flatEntityToCreate)) {
        throw new FlatEntityMapsException(
          'Could not find flat entity to create in maps should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
        entityToDeleteId: flatEntityToCreateId,
        flatEntityMapsToMutate: remainingFlatEntityMapsToCreate,
      });

      const validationResult = await this.validateFlatEntityCreation({
        flatEntityToValidate: flatEntityToCreate,
        workspaceId,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        remainingFlatEntityMapsToValidate: remainingFlatEntityMapsToCreate,
        buildOptions,
      });

      if (validationResult.status === 'fail') {
        allValidationResult.push(validationResult);
        continue;
      }

      addFlatEntityToFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatEntityToCreate,
        flatEntityAndRelatedMapsToMutate:
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        metadataName: this.metadataName,
      });

      actionsResult.create.push(
        ...(Array.isArray(validationResult.action)
          ? validationResult.action
          : [validationResult.action]),
      );
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

    const flatEntityToDeleteIds = shouldInferDeletionFromMissingEntities({
      buildOptions,
      metadataName: this.metadataName,
    })
      ? Object.keys(deletedFlatEntityMaps.byId)
      : [];

    for (const flatEntityToDeleteId of flatEntityToDeleteIds) {
      const flatEntityToDelete =
        deletedFlatEntityMaps.byId[flatEntityToDeleteId];

      if (!isDefined(flatEntityToDelete)) {
        throw new FlatEntityMapsException(
          'Could not find flat entity to delete in maps should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      deleteFlatEntityFromFlatEntityMapsThroughMutationOrThrow({
        entityToDeleteId: flatEntityToDeleteId,
        flatEntityMapsToMutate: remainingFlatEntityMapsToDelete,
      });

      const validationResult = await this.validateFlatEntityDeletion({
        flatEntityToValidate: flatEntityToDelete,
        workspaceId,
        remainingFlatEntityMapsToValidate: remainingFlatEntityMapsToDelete,
        buildOptions,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
      });

      if (validationResult.status === 'fail') {
        allValidationResult.push(validationResult);
        continue;
      }

      deleteFlatEntityFromFlatEntityAndRelatedEntityMapsThroughMutationOrThrow({
        flatEntity: flatEntityToDelete,
        flatEntityAndRelatedMapsToMutate:
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        metadataName: this.metadataName,
      });

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

    for (const flatEntityToUpdateId in updatedFlatEntityMaps.byId) {
      const flatEntityToUpdate =
        updatedFlatEntityMaps.byId[flatEntityToUpdateId];

      if (!isDefined(flatEntityToUpdate)) {
        throw new FlatEntityMapsException(
          'Could not find flat entity updates in maps dispatcher should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const validationResult = await this.validateFlatEntityUpdate({
        flatEntityUpdates: flatEntityToUpdate.updates,
        flatEntityId: flatEntityToUpdateId,
        optimisticFlatEntityMapsAndRelatedFlatEntityMaps,
        workspaceId,
        buildOptions,
      });

      if (validationResult.status === 'fail') {
        allValidationResult.push(validationResult);
        continue;
      }

      const existingFlatEntity = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatEntityToUpdateId,
        flatEntityMaps: optimisticFlatEntityMapsAndRelatedFlatEntityMaps[
          flatEntityMapsKey
        ] as MetadataFlatEntityMaps<T>,
      });

      if (!isDefined(existingFlatEntity)) {
        throw new FlatEntityMapsException(
          'Existing flat entity to update post successful validation is not defined, should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      const updatedFlatEntity = {
        ...existingFlatEntity,
        ...fromFlatEntityPropertiesUpdatesToPartialFlatEntity({
          updates: flatEntityToUpdate.updates,
        }),
      };

      replaceFlatEntityInFlatEntityMapsThroughMutationOrThrow({
        flatEntity: updatedFlatEntity,
        flatEntityMapsToMutate:
          optimisticFlatEntityMapsAndRelatedFlatEntityMaps[flatEntityMapsKey],
      });

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
    args: FlatEntityValidationArgs<T>,
  ):
    | FlatEntityValidationReturnType<T, 'create'>
    | Promise<FlatEntityValidationReturnType<T, 'create'>>;

  protected abstract validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<T>,
  ):
    | FlatEntityValidationReturnType<T, 'delete'>
    | Promise<FlatEntityValidationReturnType<T, 'delete'>>;

  protected abstract validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<T>,
  ):
    | FlatEntityValidationReturnType<T, 'update'>
    | Promise<FlatEntityValidationReturnType<T, 'update'>>;
}
