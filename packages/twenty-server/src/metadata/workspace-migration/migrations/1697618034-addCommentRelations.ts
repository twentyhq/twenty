import { StandardWorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/interfaces/standard-workspace-migration-table-action.interface';

import { WorkspaceMigrationColumnActionType } from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addCommentRelations: StandardWorkspaceMigrationTableAction[] = [
  {
    name: 'comment',
    action: 'alter',
    columns: [
      {
        columnName: 'authorId',
        referencedTableName: 'workspaceMember',
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
