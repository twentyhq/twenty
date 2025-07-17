import { EachTestingContext } from 'twenty-shared/testing';

import { ConvertActionTypeToCamelCase } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/convert-action-type-to-camel-case.type';
import { WorkspaceMigrationActionTypeV2 } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/types/workspace-migration-action-common-v2';
import { WorkspaceMigrationBuilderV2Service } from 'src/engine/workspace-manager/workspace-migration-v2/workspace-migration-builder-v2/workspace-migration-builder-v2.service';

type WorkspaceBuilderArgs = Parameters<
  typeof WorkspaceMigrationBuilderV2Service.prototype.build
>[0]['objectMetadataFromToInputs'];

export type CamelCasedWorkspaceMigrationActionsType =
  ConvertActionTypeToCamelCase<WorkspaceMigrationActionTypeV2>;

export type ExpectedActionCounters = Partial<
  Record<CamelCasedWorkspaceMigrationActionsType, number>
>;

export type WorkspaceMigrationBuilderTestCase = EachTestingContext<{
  input: WorkspaceBuilderArgs | (() => WorkspaceBuilderArgs);
  expectedActionsTypeCounter?: ExpectedActionCounters;
}>;
