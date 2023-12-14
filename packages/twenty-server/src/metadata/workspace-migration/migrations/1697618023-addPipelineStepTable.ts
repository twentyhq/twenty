import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addPipelineStepTable: StandardWorkspaceMigrationTableAction[] = [
  {
    name: 'pipelineStep',
    action: 'create',
  },
  {
    name: 'pipelineStep',
    action: 'alter',
    columns: [
      {
        columnName: 'name',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'color',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'position',
        columnType: 'float',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: 0,
      },
    ],
  },
];
