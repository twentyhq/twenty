import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addCompanyRelations: WorkspaceMigrationTableAction[] = [
  {
    name: 'company',
    action: 'alter',
    columns: [
      {
        columnName: 'accountOwnerId',
        referencedTableName: 'workspaceMember',
        referencedTableColumnName: 'id',
        action: WorkspaceMigrationColumnActionType.RELATION,
      },
    ],
  },
];
