import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addCompanyRelations: StandardWorkspaceMigrationTableAction[] = [
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
