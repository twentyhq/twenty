import { WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';
import { EachTestingContext } from 'twenty-shared/testing';

type WorkspaceBuilderArgs = Parameters<
  typeof WorkspaceMigrationBuilderV2Service.prototype.build
>[0];

type ConvertActionTypeToCamelCase<T extends string> =
  T extends `${infer Before}_${infer After}`
    ? `${Before}${Capitalize<After>}`
    : T;

export type CamelCasedWorkspaceMigrationActionsType =
  ConvertActionTypeToCamelCase<WorkspaceMigrationActionTypeV2>;

export type ExpectedActionCounters = {
  total: number; // Could be removed and computed dynamically but still a good thing for readability ?
} & Partial<Record<CamelCasedWorkspaceMigrationActionsType, number>>;

export type WorkspaceMigrationBuilderTestCase = EachTestingContext<{
  input: WorkspaceBuilderArgs | (() => WorkspaceBuilderArgs);
  expectedActionsTypeCounter: ExpectedActionCounters;
}>;
