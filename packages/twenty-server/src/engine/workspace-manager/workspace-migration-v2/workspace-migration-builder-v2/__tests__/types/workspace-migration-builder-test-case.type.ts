import { type EachTestingContext } from 'twenty-shared/testing';

import { type WorkspaceMigrationBuildArgs } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/services/workspace-migration-builder-v2.service';
import { type ConvertActionTypeToCamelCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/convert-action-type-to-camel-case.type';
import { type WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';

export type CamelCasedWorkspaceMigrationActionsType =
  ConvertActionTypeToCamelCase<WorkspaceMigrationActionTypeV2>;

export type ExpectedActionCounters = Partial<
  Record<CamelCasedWorkspaceMigrationActionsType, number>
>;

type TestWorkspaceMigrationBuildArgs = Omit<
  WorkspaceMigrationBuildArgs,
  'workspaceId' | 'buildOptions'
> &
  Partial<Pick<WorkspaceMigrationBuildArgs, 'buildOptions'>>;

export type WorkspaceMigrationBuilderTestCase = EachTestingContext<{
  input:
    | TestWorkspaceMigrationBuildArgs
    | (() => TestWorkspaceMigrationBuildArgs);
}>;
