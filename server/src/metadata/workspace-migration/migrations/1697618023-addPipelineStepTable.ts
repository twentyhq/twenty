import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addPipelineStepTable: WorkspaceMigrationTableAction[] = [
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
      },
      {
        columnName: 'color',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'position',
        columnType: 'float',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];
