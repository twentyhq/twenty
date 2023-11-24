import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addPersonTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'person',
    action: 'create',
  },
  {
    name: 'person',
    action: 'alter',
    columns: [
      {
        columnName: 'nameFirstName',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'nameLastName',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'email',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'linkedinLinkUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'linkedinLinkLabel',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'xLinkUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'xLinkLabel',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'jobTitle',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'phone',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'city',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'avatarUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
        defaultValue: "''",
      },
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];
