import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addViewFieldTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'viewField',
    action: 'create',
  },
  {
    name: 'viewField',
    action: 'alter',
    columns: [
      {
        columnName: 'fieldMetadataId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'position',
        columnType: 'float',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: 0,
      },
      {
        columnName: 'isVisible',
        columnType: 'boolean',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: true,
      },
      {
        columnName: 'size',
        columnType: 'integer',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: 0,
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
