import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addFavoriteTable: StandardWorkspaceMigrationTableAction[] = [
  {
    name: 'favorite',
    action: 'create',
  },
  {
    name: 'favorite',
    action: 'alter',
    columns: [
      {
        columnName: 'position',
        columnType: 'float',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: 0,
      },
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'personId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'workspaceMemberId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];
