import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addOpportunityTable: TenantMigrationTableAction[] = [
  {
    name: 'opportunity',
    action: 'create',
  },
  {
    name: 'opportunity',
    action: 'alter',
    columns: [
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];
