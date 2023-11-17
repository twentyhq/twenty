import {
  WorkspaceMigrationColumnActionType,
  WorkspaceMigrationTableAction,
} from 'src/metadata/workspace-migration/workspace-migration.entity';

export const addCompanyTable: WorkspaceMigrationTableAction[] = [
  {
    name: 'company',
    action: 'create',
  },
  {
    name: 'company',
    action: 'alter',
    columns: [
      {
        columnName: 'name',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'domainName',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'address',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'employees',
        columnType: 'integer',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'linkedinUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'xUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'annualRecurringRevenue',
        columnType: 'float',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'idealCustomerProfile',
        columnType: 'boolean',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'accountOwnerId',
        columnType: 'uuid',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
    ],
  },
];
