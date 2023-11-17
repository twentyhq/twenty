import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPipelineStepTable: TenantMigrationTableAction[] = [
  {
    name: 'pipelineStep',
    action: 'create',
  },
  {
    name: 'pipelineStep',
    action: 'alter',
    columns: [
      {
        columnName: 'name',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'color',
        columnType: 'varchar',
        action: TenantMigrationColumnActionType.CREATE,
      },
      {
        columnName: 'position',
        columnType: 'float',
        action: TenantMigrationColumnActionType.CREATE,
      },
    ],
  },
];
