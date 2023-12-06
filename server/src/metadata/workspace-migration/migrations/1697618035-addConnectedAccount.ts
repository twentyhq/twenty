import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addConnectedAccount: WorkspaceMigrationTableAction[] = [
  {
    name: 'connectedAccount',
    action: 'create',
  },
  {
    name: 'connectedAccount',
    action: 'alter',
    columns: [
      {
        columnName: 'type',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
    ],
  },
];
