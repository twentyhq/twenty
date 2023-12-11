import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addViewSortTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'viewSort',
    action: 'create',
  },
  {
    name: 'viewSort',
    action: 'alter',
    columns: [
      {
        columnName: 'fieldMetadataId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'direction',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "'asc'",
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
