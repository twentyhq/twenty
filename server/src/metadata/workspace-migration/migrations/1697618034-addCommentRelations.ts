import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addCommentRelations: WorkspaceMigrationTableAction[] = [
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
