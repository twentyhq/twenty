import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addPersonRelations: WorkspaceMigrationTableAction[] = [
  {
    name: 'person',
    action: 'alter',
    columns: [
      {
        columnName: 'companyId',
        referencedTableName: 'company',
        referencedTableColumnName: 'id',
        action: WorkspaceMigrationColumnActionType.RELATION,
      },
    ],
  },
];
