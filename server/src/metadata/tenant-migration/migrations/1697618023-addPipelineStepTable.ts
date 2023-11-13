import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addPipelineStepTable: TenantMigrationTableAction[] = [
  {
    name: 'pipelineStep',
    action: 'create',
  },
  {
    name: 'pipelineStep',
    action: 'alter',
    columns: [],
  },
];
