import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { T } from '@faker-js/faker/dist/airline-BUL6NtOJ';
import {
  AllFlatEntityMaps,
  AllFlatMapsEntities,
} from 'src/engine/core-modules/common/types/all-flat-entity-maps.type';
import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import {
  DeletedCreatedUpdatedMatrix,
  deletedCreatedUpdatedMatrixDispatcher,
} from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { WorkspaceMigrationV2BuilderOptions } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';

export type SuccessfulEntityMigrationBuildResult = {
  status: 'success';
  workspaceMigration: WorkspaceMigrationV2;
  optimisticAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
};

export type FailedEntityMigrationBuildResult<TFailedValidation> = {
  status: 'fail';
  errors: TFailedValidation[];
  optimisticAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
};

export type ValidateAndBuildArgs<
  T extends FlatEntity,
  TMaps extends AllFlatMapsEntities[],
> = {
  workspaceId: string;
  buildOptions: WorkspaceMigrationV2BuilderOptions;
  dependencyFlatEntityMaps: Pick<AllFlatEntityMaps, TMaps[number]>;
} & FromTo<FlatEntityMaps<T>>;

export type ValidateAndBuildActionsArgs<
  T extends FlatEntity,
  TMaps extends AllFlatMapsEntities[],
> = ValidateAndBuildArgs<T, TMaps> &
  DeletedCreatedUpdatedMatrix<T>

export type ValidateAndBuilActionsReturnType<
  TFailedValidation,
  TActionType extends WorkspaceMigrationActionV2,
> = {
  failed: TFailedValidation[];
  created: TActionType[];
  deleted: TActionType[];
  updated: TActionType[];
  optimisticAllFlatEntityMaps: Partial<AllFlatEntityMaps>;
};

export abstract class WorkspaceEntityMigrationBuilderV2Service<
  TFlatEntity extends FlatEntity,
  TFailedValidation, // improve typing poor
  TActionType extends WorkspaceMigrationActionV2,
  TMaps extends AllFlatMapsEntities[],
> {
  public async validateAndBuild(
    args: ValidateAndBuildArgs<TFlatEntity, TMaps>,
  ): Promise<
    | SuccessfulEntityMigrationBuildResult
    | FailedEntityMigrationBuildResult<TFailedValidation>
  > {
    const { from: fromEntityMaps, to: toEntityMaps } = args;

    const fromEntities = Object.values(fromEntityMaps.byId).filter(isDefined);
    const toEntities = Object.values(toEntityMaps.byId).filter(isDefined);

    const { created, deleted, updated } = deletedCreatedUpdatedMatrixDispatcher(
      {
        from: fromEntities,
        to: toEntities,
      },
    );

    const result = await this.validateAndBuildActions({
      ...args,
      created,
      updated,
      deleted,
    });

    if (result.failed.length > 0) {
      return {
        status: 'fail',
        errors: result.failed,
        optimisticAllFlatEntityMaps: result.optimisticAllFlatEntityMaps,
      };
    }

    return {
      status: 'success',
      workspaceMigration: {
        workspaceId: args.workspaceId,
        actions: [...result.deleted, ...result.created, ...result.updated],
      },
      optimisticAllFlatEntityMaps: result.optimisticAllFlatEntityMaps,
    };
  }

  protected abstract validateAndBuildActions(
    args: ValidateAndBuildActionsArgs<TFlatEntity, T>,
  ): Promise<ValidateAndBuilActionsReturnType<TFailedValidation, TActionType>>;
}
