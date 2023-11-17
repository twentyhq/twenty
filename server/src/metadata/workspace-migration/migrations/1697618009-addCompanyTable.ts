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
        defaultValue: "''",
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
        columnName: 'linkedinLinkUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'linkedinLinkLabel',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'xLinkUrl',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'xLinkLabel',
        columnType: 'varchar',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'annualRecurringRevenueAmountMicros',
        columnType: 'integer',
        action: WorkspaceMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'annualRecurringRevenueCurrencyCode',
        columnType: 'varchar',
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
