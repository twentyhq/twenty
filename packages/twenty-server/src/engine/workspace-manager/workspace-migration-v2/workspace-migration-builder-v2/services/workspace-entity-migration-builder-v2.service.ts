import { type FromTo } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/core-modules/common/types/flat-entity-maps.type';
import { type FlatEntity } from 'src/engine/core-modules/common/types/flat-entity.type';
import { deletedCreatedUpdatedMatrixDispatcher } from 'src/engine/workspace-manager/workspace-migration-v2/utils/deleted-created-updated-matrix-dispatcher.util';
import { type WorkspaceMigrationActionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { type WorkspaceMigrationV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-v2';

export type SuccessfulEntityMigrationBuildResult<TFlatEntityMaps> = {
  status: 'success';
  workspaceMigration: WorkspaceMigrationV2;
  optimisticFlatEntityMaps: TFlatEntityMaps;
};

export type FailedEntityMigrationBuildResult<TFailedValidation> = {
  status: 'fail';
  errors: TFailedValidation[];
};

export abstract class WorkspaceEntityMigrationBuilderV2Service<
  TFlatEntityMaps extends FlatEntityMaps<TFlatEntity>,
  TFlatEntity extends FlatEntity,
  TFailedValidation,
  TActionType extends WorkspaceMigrationActionV2,
  TBuildArgs extends { workspaceId: string } & FromTo<TFlatEntityMaps, string>,
> {
  public async validateAndBuild(
    args: TBuildArgs,
  ): Promise<
    | SuccessfulEntityMigrationBuildResult<TFlatEntityMaps>
    | FailedEntityMigrationBuildResult<TFailedValidation>
  > {
    const { from: fromEntityMaps, to: toEntityMaps } =
      this.extractFromToEntityMaps(args);

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
      };
    }

    return {
      status: 'success',
      workspaceMigration: {
        workspaceId: args.workspaceId,
        actions: [...result.deleted, ...result.created, ...result.updated],
      },
      optimisticFlatEntityMaps: result.optimisticMaps,
    };
  }

  // TODO: Refactor, this is too hacky
  private extractFromToEntityMaps(args: TBuildArgs): {
    from: TFlatEntityMaps;
    to: TFlatEntityMaps;
  } {
    const fromKey = Object.keys(args).find((key) =>
      key.startsWith('from'),
    ) as keyof TBuildArgs;
    const toKey = Object.keys(args).find((key) =>
      key.startsWith('to'),
    ) as keyof TBuildArgs;

    return {
      from: args[fromKey] as TFlatEntityMaps,
      to: args[toKey] as TFlatEntityMaps,
    };
  }

  protected abstract validateAndBuildActions(
    args: TBuildArgs & {
      created: TFlatEntity[];
      updated: { from: TFlatEntity; to: TFlatEntity }[];
      deleted: TFlatEntity[];
    },
  ): Promise<{
    failed: TFailedValidation[];
    created: TActionType[];
    deleted: TActionType[];
    updated: TActionType[];
    optimisticMaps: TFlatEntityMaps;
  }>;
}
