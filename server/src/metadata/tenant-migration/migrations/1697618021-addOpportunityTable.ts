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
        columnName: 'amount',
        columnType: 'float',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'probability',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'closeDate',
        columnType: 'timestamp',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'companyId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'personId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'pipelineStepId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'pointOfContactId',
        columnType: 'uuid',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];
