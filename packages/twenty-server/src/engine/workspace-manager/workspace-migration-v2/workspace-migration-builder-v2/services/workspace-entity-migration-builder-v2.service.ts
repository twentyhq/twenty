import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  FlatEntityMapsException,
  FlatEntityMapsExceptionCode,
} from 'src/engine/core-modules/common/exceptions/flat-entity-maps.exception';
import { type AllFlatEntities } from 'src/engine/core-modules/common/types/all-flat-entities.type';
import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
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
> = {
  status: 'success';
  actions: CreatedDeletedUpdatedActions<TActions>;
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
};

export type FailedEntityMigrationBuildResult<TFlatEntity extends AllFlatEntities> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<TFlatEntity>[];
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
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
> =
  | SuccessfulEntityMigrationBuildResult<TActions, TFlatEntity>
  | FailedEntityMigrationBuildResult<TFlatEntity>;

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
> =
  | {
      status: 'success';
      action: TActions | TActions[];
    }
  | ({
      status: 'fail';
    } & FailedFlatEntityValidation<TFlatEntity>);

export abstract class WorkspaceEntityMigrationBuilderV2Service<
  TFlatEntity extends AllFlatEntities,
  TActions extends WorkspaceMigrationActionV2,
  TRelatedFlatEntityMaps extends
    | Partial<AllFlatEntityMaps>
    | undefined = undefined,
> {
  public async validateAndBuild({
    buildOptions,
    dependencyOptimisticFlatEntityMaps,
    from: fromFlatEntityMaps,
    to: toFlatEntityMaps,
    workspaceId,
  }: ValidateAndBuildArgs<TFlatEntity, TRelatedFlatEntityMaps>): Promise<
    ValidateAndBuildReturnType<TActions, TFlatEntity>
  > {
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
    });

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
    for (const flatEntityToCreateId in createdFlatEntityMaps) {
      const flatEntityToCreate =
        createdFlatEntityMaps.byId[flatEntityToCreateId];

      if (!isDefined(flatEntityToCreate)) {
        throw new FlatEntityMapsException(
          'TMP',
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

      validateAndBuildResult.created.push(
        ...(Array.isArray(validationResult.action)
          ? validationResult.action
          : [validationResult.action]),
      );
    }

    let remainingFlatEntityMapsToDelete = structuredClone(
      deletedFlatEntityMaps,
    );
    for (const flatEntityToDeleteId in buildOptions.inferDeletionFromMissingEntities
      ? deletedFlatEntityMaps
      : {}) {
      const flatEntityToDelete =
        deletedFlatEntityMaps.byId[flatEntityToDeleteId];

      if (!isDefined(flatEntityToDelete)) {
        throw new FlatEntityMapsException(
          'TMP',
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

      validateAndBuildResult.deleted.push(
        ...(Array.isArray(validationResult.action)
          ? validationResult.action
          : [validationResult.action]),
      );
    }

    let remainingFlatEntityMapsToUpdate = structuredClone(
      updatedFlatEntityMaps,
    );
    for (const flatEntityToUpdateId in updatedFlatEntityMaps) {
      const flatEntityToUpdateFrom =
        updatedFlatEntityMaps.from.byId[flatEntityToUpdateId];
      const flatEntityToUpdateTo =
        updatedFlatEntityMaps.to.byId[flatEntityToUpdateId];
      if (
        !isDefined(flatEntityToUpdateTo) ||
        !isDefined(flatEntityToUpdateFrom)
      ) {
        throw new FlatEntityMapsException(
          'TMP',
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

      validateAndBuildResult.updated.push(
        ...(Array.isArray(validationResult.action)
          ? validationResult.action
          : [validationResult.action]),
      );
    }

    if (validateAndBuildResult.failed.length > 0) {
      return {
        status: 'fail',
        errors: validateAndBuildResult.failed,
        optimisticFlatEntityMaps,
      };
    }

    return {
      status: 'success',
      actions: {
        created: validateAndBuildResult.created,
        deleted: validateAndBuildResult.deleted,
        updated: validateAndBuildResult.updated,
      },
      optimisticFlatEntityMaps,
    };
  }

  protected abstract validateFlatEntityCreation(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity>>;

  protected abstract validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity>>;

  protected abstract validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity> | undefined>;
}
