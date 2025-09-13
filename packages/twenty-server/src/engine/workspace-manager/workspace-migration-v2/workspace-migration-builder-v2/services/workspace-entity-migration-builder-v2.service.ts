import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import {
  type DeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { type FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { type WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type SuccessfulEntityMigrationBuildResult<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends FlatEntity,
> = {
  status: 'success';
  actions: TActions[];
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
};

export type FailedEntityMigrationBuildResult<TFlatEntity extends FlatEntity> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<TFlatEntity>[];
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
};

export type ValidateAndBuildArgs<
  T extends FlatEntity,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps>,
> = {
  buildOptions: WorkspaceMigrationV2BuilderOptions;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
} & FromTo<FlatEntityMaps<T>>;

export type ValidateAndBuildReturnType<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends FlatEntity,
> =
  | SuccessfulEntityMigrationBuildResult<TActions, TFlatEntity>
  | FailedEntityMigrationBuildResult<TFlatEntity>;

export type ValidateAndBuildActionsArgs<
  T extends FlatEntity,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps>,
> = ValidateAndBuildArgs<T, TRelatedFlatEntityMaps> &
  DeletedCreatedUpdatedMatrix<T>;

export type ValidateAndBuilActionsReturnType<
  TFlatEntity extends FlatEntity,
  TActions extends WorkspaceMigrationActionV2,
> = {
  failed: FailedFlatEntityValidation<TFlatEntity>[];
  created: TActions[];
  deleted: TActions[];
  updated: TActions[];
};

export type FlatEntityValidationArgs<
  TFlatEntity extends FlatEntity,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps>,
> = {
  flatEntityToValidate: TFlatEntity;
  optimisticFlatEntityMaps: FlatEntityMaps<TFlatEntity>;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
};

export type FlatEntityUpdateValidationArgs<
  TFlatEntity extends FlatEntity,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps>,
> = Omit<
  FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  'flatEntityToValidate'
> & {
  flatEntityUpdate: FromTo<TFlatEntity>;
};

export type FlatEntityValidationReturnType<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends FlatEntity,
> =
  | {
      status: 'success';
      action: TActions;
    }
  | ({
      status: 'fail';
    } & FailedFlatEntityValidation<TFlatEntity>);

export abstract class WorkspaceEntityMigrationBuilderV2Service<
  TFlatEntity extends FlatEntity,
  TActions extends WorkspaceMigrationActionV2,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps>,
> {
  public async validateAndBuild({
    buildOptions,
    dependencyOptimisticFlatEntityMaps,
    from: fromFlatEntityMaps,
    to: toFlatEntityMaps,
  }: ValidateAndBuildArgs<TFlatEntity, TRelatedFlatEntityMaps>): Promise<
    ValidateAndBuildReturnType<TActions, TFlatEntity>
  > {
    const fromFlatEntities = Object.values(fromFlatEntityMaps.byId).filter(
      isDefined,
    );
    const toFlatEntities = Object.values(toFlatEntityMaps.byId).filter(
      isDefined,
    );

    const { created, deleted, updated } = deletedCreatedUpdatedMatrixDispatcher(
      {
        from: fromFlatEntities,
        to: toFlatEntities,
      },
    );
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

    for (const flatViewFieldToCreate of created) {
      const validationResult = await this.validateFlatEntityCreation({
        dependencyOptimisticFlatEntityMaps,
        flatEntityToValidate: flatViewFieldToCreate,
        optimisticFlatEntityMaps,
      });

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticFlatEntityMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatViewFieldToCreate,
        flatEntityMaps: optimisticFlatEntityMaps,
      });

      validateAndBuildResult.created.push(validationResult.action);
    }

    for (const flatViewFieldToDelete of buildOptions.inferDeletionFromMissingEntities
      ? deleted
      : []) {
      const validationResult = await this.validateFlatEntityDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatEntityToValidate: flatViewFieldToDelete,
        optimisticFlatEntityMaps: optimisticFlatEntityMaps,
      });

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticFlatEntityMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: flatViewFieldToDelete.id,
        flatEntityMaps: optimisticFlatEntityMaps,
      });

      validateAndBuildResult.deleted.push(validationResult.action);
    }

    for (const flatEntityUpdate of updated) {
      const validationResult = await this.validateFlatEntityUpdate({
        dependencyOptimisticFlatEntityMaps,
        flatEntityUpdate,
        optimisticFlatEntityMaps: optimisticFlatEntityMaps,
      });

      if (validationResult === undefined) {
        continue;
      }

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticFlatEntityMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: flatEntityUpdate.to,
        flatEntityMaps: optimisticFlatEntityMaps,
      });

      validateAndBuildResult.updated.push(validationResult.action);
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
      actions: [
        ...validateAndBuildResult.deleted,
        ...validateAndBuildResult.created,
        ...validateAndBuildResult.updated,
      ],
      optimisticFlatEntityMaps,
    };
  }

  protected abstract validateFlatEntityCreation(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity>>;

  protected abstract validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity>>;

  // Create util type
  protected abstract validateFlatEntityUpdate(
    args: FlatEntityUpdateValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity> | undefined>;
}
