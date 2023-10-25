import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPipelineStageTable: TenantMigrationTableAction[] = [
  {
    name: 'pipeline_stage',
    action: 'create',
  },
  {
    name: 'pipeline_stage',
    action: 'alter',
    columns: [
      {
        name: 'id',
        type: 'text',
        action: 'create',
      },
      {
        name: 'name',
        type: 'text',
        action: 'create',
      },
      {
        name: 'type',
        type: 'text',
        action: 'create',
      },
      {
        name: 'color',
        type: 'text',
        action: 'create',
      },
      {
        name: 'index',
        type: 'integer',
        action: 'create',
      },
      {
        name: 'createdAt',
        action: 'create',
        type: 'timestamp',
      },
      {
        name: 'updatedAt',
        action: 'create',
        type: 'timestamp',
      },
    ],
  },
];
