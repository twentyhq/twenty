import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addOpportunityRelations: TenantMigrationTableAction[] = [
  {
    name: 'opportunity',
    action: 'alter',
    columns: [
      {
        columnName: 'companyId',
        referencedTableName: 'company',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
      {
        columnName: 'personId',
        referencedTableName: 'person',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
      {
        columnName: 'pointOfContactId',
        referencedTableName: 'person',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
      {
        columnName: 'pipelineStepId',
        referencedTableName: 'pipelineStep',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
    ],
  },
];
