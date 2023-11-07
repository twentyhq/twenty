import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addViewTable: TenantMigrationTableAction[] = [
  {
    name: 'view',
    action: 'create',
  },
  {
    name: 'view',
    action: 'alter',
    columns: [
      {
        columnName: 'name',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'objectId',
        columnType: 'varchar',
        action: 'create',
      },
      {
        columnName: 'type',
        columnType: 'varchar',
        action: 'create',
      },
    ],
  },
];
