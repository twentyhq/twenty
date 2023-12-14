import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addViewFilterTable: StandardWorkspaceMigrationTableAction[] = [
  {
    name: 'viewFilter',
    action: 'create',
  },
  {
    name: 'viewFilter',
    action: 'alter',
    columns: [
      {
        columnName: 'fieldMetadataId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'operand',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "'Contains'",
      },
      {
        columnName: 'value',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'displayValue',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'viewId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'viewId',
        referencedTableName: 'view',
        referencedTableColumnName: 'id',
        action: WorkspaceMigrationColumnActionType.RELATION,
      },
    ],
  },
];
