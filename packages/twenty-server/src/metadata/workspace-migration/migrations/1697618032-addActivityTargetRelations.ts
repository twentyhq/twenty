import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addActivityTargetRelations: StandardWorkspaceMigrationTableAction[] =
  [
    {
      name: 'activityTarget',
      action: 'alter',
      columns: [
        {
          columnName: 'companyId',
          referencedTableName: 'company',
          referencedTableColumnName: 'id',
          action: WorkspaceMigrationColumnActionType.RELATION,
        },
        {
          columnName: 'personId',
          referencedTableName: 'person',
          referencedTableColumnName: 'id',
          action: WorkspaceMigrationColumnActionType.RELATION,
        },
        {
          columnName: 'activityId',
          referencedTableName: 'activity',
          referencedTableColumnName: 'id',
          action: WorkspaceMigrationColumnActionType.RELATION,
        },
      ],
    },
  ];
