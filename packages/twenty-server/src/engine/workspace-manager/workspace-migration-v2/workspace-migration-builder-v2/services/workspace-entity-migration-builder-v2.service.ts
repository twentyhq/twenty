import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { AllFlatEntityMaps } from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { deleteFlatEntityFromFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/delete-flat-entity-from-flat-entity-maps-or-throw.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/core-modules/common/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import {
  DeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { FailedFlatEntityValidation } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/builders/types/failed-flat-entity-validation.type';
import { WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type SuccessfulEntityMigrationBuildResult<
  TActions extends WorkspaceMigrationActionV2,
> = {
  status: 'success';
  actions: TActions[];
  optimisticAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
};

export type FailedEntityMigrationBuildResult<TFlatEntity extends FlatEntity> = {
  status: 'fail';
  errors: FailedFlatEntityValidation<TFlatEntity>[];
  optimisticAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
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
  | SuccessfulEntityMigrationBuildResult<TActions>
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
  optimisticAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
};

export type FlatEntityValidationArgs<
  TFlatEntity extends FlatEntity,
  TRelatedFlatEntityMaps extends Partial<AllFlatEntityMaps>,
> = {
  flatEntityToValidate: TFlatEntity;
  optimisticEntityMaps: FlatEntityMaps<TFlatEntity>;
  dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
};

export type FlatEntityValidationReturnType<
  TActions extends WorkspaceMigrationActionV2,
  TFlatEntity extends FlatEntity,
> =
  | {
      status: 'success';
      action: TActions;
    }
  | ({ status: 'fail' } & FailedFlatEntityValidation<TFlatEntity>);

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
    let optimisticEntityMaps = structuredClone(fromFlatEntityMaps);

    const validateAndBuildResult: Omit<
      ValidateAndBuilActionsReturnType<TFlatEntity, TActions>,
      'optimisticAllFlatEntityMaps'
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
        optimisticEntityMaps,
      });

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticEntityMaps = addFlatEntityToFlatEntityMapsOrThrow({
        flatEntity: flatViewFieldToCreate,
        flatEntityMaps: optimisticEntityMaps,
      });

      validateAndBuildResult.created.push(validationResult.action);
    }

    for (const flatViewFieldToDelete of buildOptions.inferDeletionFromMissingEntities
      ? deleted
      : []) {
      const validationResult = await this.validateFlatEntityDeletion({
        dependencyOptimisticFlatEntityMaps,
        flatEntityToValidate: flatViewFieldToDelete,
        optimisticEntityMaps,
      });

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticEntityMaps = deleteFlatEntityFromFlatEntityMapsOrThrow({
        entityToDeleteId: flatViewFieldToDelete.id,
        flatEntityMaps: optimisticEntityMaps,
      });

      validateAndBuildResult.deleted.push(validationResult.action);
    }

    for (const flatEntityUpdate of updated) {
      const validationResult = await this.validateFlatEntityUpdate({
        dependencyOptimisticFlatEntityMaps,
        flatEntityUpdate,
        optimisticEntityMaps,
      });

      if (validationResult === undefined) {
        continue;
      }

      if (validationResult.status === 'fail') {
        validateAndBuildResult.failed.push(validationResult);
        continue;
      }

      optimisticEntityMaps = replaceFlatEntityInFlatEntityMapsOrThrow({
        flatEntity: flatEntityUpdate.to,
        flatEntityMaps: optimisticEntityMaps,
      });

      validateAndBuildResult.updated.push(validationResult.action);
    }

    if (validateAndBuildResult.failed.length > 0) {
      return {
        status: 'fail',
        errors: validateAndBuildResult.failed,
        optimisticAllFlatEntityMaps: {}, // TODO
      };
    }

    return {
      status: 'success',
      actions: [
        ...validateAndBuildResult.deleted,
        ...validateAndBuildResult.created,
        ...validateAndBuildResult.updated,
      ],
      optimisticAllFlatEntityMaps: {}, // TODO
    };
  }

  protected abstract validateFlatEntityCreation(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity>>;

  protected abstract validateFlatEntityDeletion(
    args: FlatEntityValidationArgs<TFlatEntity, TRelatedFlatEntityMaps>,
  ): Promise<FlatEntityValidationReturnType<TActions, TFlatEntity>>;

  protected abstract validateFlatEntityUpdate(args: {
    flatEntityUpdate: FromTo<TFlatEntity>;
    optimisticEntityMaps: FlatEntityMaps<TFlatEntity>;
    dependencyOptimisticFlatEntityMaps: TRelatedFlatEntityMaps;
  }): Promise<
    FlatEntityValidationReturnType<TActions, TFlatEntity> | undefined
  >;
}
