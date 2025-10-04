import { Inject } from '@nestjs/common';

import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { AllFlatEntitiesByMetadataEngineName } from 'src/engine/core-modules/common/types/all-flat-entities-by-metadata-engine-name.type';
import { type AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { LoggerService } from 'src/engine/core-modules/logger/logger.service';
import {
  type DeletedCreatedUpdatedMatrix,
  flatEntityDeletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/flat-entity-deleted-created-updated-matrix-dispatcher.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type WorkspaceMigrationBuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-builder-options.type';

// TODO extract types in dedicated files
export type CreatedDeletedUpdatedActions<
  TActions extends WorkspaceMigrationActionV2,
> = {
  created: TActions[];
  deleted: TActions[];
  updated: TActions[];
};

export type SuccessfulEntityMigrationBuildResult<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> = {
  status: 'success';
  actions: CreatedDeletedUpdatedActions<TActions>;
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
};

export type FailedEntityMigrationBuildResult<
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<TFlatEntity>[];
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
};

export type ValidateAndBuildArgs<
  T extends AllFlatEntities,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps> | undefined,
> = {
  buildOptions: WorkspaceMigrationBuilderOptions;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
  workspaceId: string;
} & FromTo<FlatEntityMaps<T>>;

export type ValidateAndBuildReturnType<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> =
  | SuccessfulEntityMigrationBuildResult<
      TActions,
      TFlatEntity,
      TRelatedFlatEntityMaps
    >
  | FailedEntityMigrationBuildResult<TFlatEntity, TRelatedFlatEntityMaps>;

export type ValidateAndBuildActionsArgs<
  T extends AllFlatEntities,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps>,
> = ValidateAndBuildArgs<T, TRelatedFlatEntityMaps> &
  DeletedCreatedUpdatedMatrix<T>;

export type ValidateAndBuilActionsReturnType<
  TFlatEntity extends AllFlatEntities,
  TActions extends WorkspaceMigrationActionV2,
> = {
  failed: FailedFlatEntityValidation<TFlatEntity>[];
} & CreatedDeletedUpdatedActions<TActions>;

export type FlatEntityValidationArgs<
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> = {
  flatEntityToValidate: TFlatEntity;
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
  workspaceId: string;
  remainingFlatEntityMapsToValidate: FlatEntityMaps<TFlatEntity>;
  buildOptions: WorkspaceMigrationBuilderOptions;
};

export type FlatEntityUpdateValidationArgs<
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> = Omit<
  FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  'flatEntityToValidate' | 'remainingFlatEntityMapsToValidate'
> & {
  flatEntityUpdate: FromTo<TFlatEntity>;
  remainingFlatEntityMapsToValidate: FromTo<FlatEntityMaps<TFlatEntity>>;
};

export type FlatEntityValidationReturnType<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends AllFlatEntities,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> =
  | {
      status: 'success';
      action: TActions | TActions[];
      dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
    }
  | ({
      status: 'fail';
    } & FailedFlatEntityValidation<TFlatEntity>);

// TODO prastoin refactor the builder to building a selection of flatEntityMaps => simplify
export abstract class WorkspaceEntityMigrationBuilderV2Service<
  T extends keyof AllFlatEntitiesByMetadataEngineName, // TODO refactor the whole generic to be inferred from this one only
  TFlatEntity extends AllFlatEntities,
  TActions extends WorkspaceMigrationActionV2,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> {
  @Inject(LoggerService)
  protected readonly logger: LoggerService;
  private metadataName: T;

  constructor(metadataName: T) {
    this.metadataName = metadataName;
  }

  public async validateAndBuild({
    buildOptions,
    dependencyOptimisticFlatEntityMaps,
    from: fromFlatEntityMaps,
    to: toFlatEntityMaps,
    workspaceId,
  }: ValidateAndBuildArgs<TFlatEntity, TRelatedFlatEntityMaps>): Promise<
    ValidateAndBuildReturnType<TActions, TFlatEntity, TRelatedFlatEntityMaps>
  > {
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
    } = flatEntityDeletedCreatedUpdatedMatrixDispatcher({
      from: fromFlatEntities,
      to: toFlatEntities,
      buildOptions,
    });

    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'matrix computation',
    );
    this.logger.time(`EntityBuilder ${this.metadataName}`, 'entity processing');

    let optimisticFlatEntityMaps = structuredClone(fromFlatEntityMaps);
    const validateAndBuildResult: ValidateAndBuilActionsReturnType<
      TFlatEntity,
      TActions
    > = {
      failed: [],
      created: [],
      deleted: [],
      updated: [],
    };

    let remainingFlatEntityMapsToCreate = structuredClone(
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

      remainingFlatEntityMapsToCreate =
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatEntityToCreateId,
          flatEntityMaps: remainingFlatEntityMapsToCreate,
        });

      const validationResult = await this.validateFlatEntityCreation({
        dependencyOptimisticFlatEntityMaps,
        flatEntityToValidate: flatEntityToCreate,
        optimisticFlatEntityMaps,
        workspaceId,
        remainingFlatEntityMapsToValidate: remainingFlatEntityMapsToCreate,
        buildOptions,
      });

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticFlatEntityMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatEntityToCreate,
        flatEntityMaps: optimisticFlatEntityMaps,
      });
      dependencyOptimisticFlatEntityMaps =
        validationResult.dependencyOptimisticFlatEntityMaps;

      validateAndBuildResult.created.push(
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

    let remainingFlatEntityMapsToDelete = structuredClone(
      deletedFlatEntityMaps,
    );

    for (const flatEntityToDeleteId in buildOptions.inferDeletionFromMissingEntities
      ? deletedFlatEntityMaps.byId
      : {}) {
      const flatEntityToDelete =
        deletedFlatEntityMaps.byId[flatEntityToDeleteId];

      if (!isDefined(flatEntityToDelete)) {
        throw new FlatEntityMapsException(
          'Could not find flat entity to delete in maps should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      remainingFlatEntityMapsToDelete =
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatEntityToDeleteId,
          flatEntityMaps: remainingFlatEntityMapsToDelete,
        });

      const validationResult = await this.validateFlatEntityDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatEntityToValidate: flatEntityToDelete,
        optimisticFlatEntityMaps: optimisticFlatEntityMaps,
        workspaceId,
        remainingFlatEntityMapsToValidate: remainingFlatEntityMapsToDelete,
        buildOptions,
      });

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticFlatEntityMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: flatEntityToDelete.id,
        flatEntityMaps: optimisticFlatEntityMaps,
      });
      dependencyOptimisticFlatEntityMaps =
        validationResult.dependencyOptimisticFlatEntityMaps;

      validateAndBuildResult.deleted.push(
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

    let remainingFlatEntityMapsToUpdate = structuredClone(
      updatedFlatEntityMaps,
    );

    for (const flatEntityToUpdateId in updatedFlatEntityMaps.to.byId) {
      const flatEntityToUpdateFrom =
        updatedFlatEntityMaps.from.byId[flatEntityToUpdateId];
      const flatEntityToUpdateTo =
        updatedFlatEntityMaps.to.byId[flatEntityToUpdateId];

      if (
        !isDefined(flatEntityToUpdateTo) ||
        !isDefined(flatEntityToUpdateFrom)
      ) {
        throw new FlatEntityMapsException(
          'Could not find flat entity to update in maps should never occur',
          FlatEntityMapsExceptionCode.ENTITY_NOT_FOUND,
        );
      }

      remainingFlatEntityMapsToUpdate.from =
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatEntityToUpdateId,
          flatEntityMaps: remainingFlatEntityMapsToUpdate.from,
        });
      remainingFlatEntityMapsToUpdate.to =
        deleteFlatEntityFromFlatEntityMapsOrThrow({
          entityToDeleteId: flatEntityToUpdateId,
          flatEntityMaps: remainingFlatEntityMapsToUpdate.to,
        });

      const validationResult = await this.validateFlatEntityUpdate({
        dependencyOptimisticFlatEntityMaps,
        flatEntityUpdate: {
          from: flatEntityToUpdateFrom,
          to: flatEntityToUpdateTo,
        },
        optimisticFlatEntityMaps: optimisticFlatEntityMaps,
        workspaceId,
        remainingFlatEntityMapsToValidate: remainingFlatEntityMapsToUpdate,
        buildOptions,
      });

      if (validationResult === undefined) {
        continue;
      }

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticFlatEntityMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: flatEntityToUpdateTo,
        flatEntityMaps: optimisticFlatEntityMaps,
      });
      dependencyOptimisticFlatEntityMaps =
        validationResult.dependencyOptimisticFlatEntityMaps;

      validateAndBuildResult.updated.push(
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

    if (validateAndBuildResult.failed.length > 0) {
      return {
        status: 'fail',
        errors: validateAndBuildResult.failed,
        optimisticFlatEntityMaps,
        dependencyOptimisticFlatEntityMaps,
      };
    }

    this.logger.timeEnd(
      `EntityBuilder ${this.metadataName}`,
      'validateAndBuild',
    );

    return {
      status: 'success',
      actions: {
        created: validateAndBuildResult.created,
        deleted: validateAndBuildResult.deleted,
        updated: validateAndBuildResult.updated,
      },
      optimisticFlatEntityMaps,
      dependencyOptimisticFlatEntityMaps,
    };
  }

  protected abstract validateFlatEntityCreation(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<
    FlatEntityValidationReturnType<
      TActions,
      TFlatEntity,
      TRelatedFlatEntityMaps
    >
  >;

  protected abstract validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<
    FlatEntityValidationReturnType<
      TActions,
      TFlatEntity,
      TRelatedFlatEntityMaps
    >
  >;

  protected abstract validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<
    | FlatEntityValidationReturnType<
        TActions,
        TFlatEntity,
        TRelatedFlatEntityMaps
      >
    | undefined
  >;
}
