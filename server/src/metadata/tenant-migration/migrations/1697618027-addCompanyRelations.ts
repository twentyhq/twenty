import {
  TenantMigrationColumnActionType,
  TenantMigrationTableAction,
} from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addCompanyRelations: TenantMigrationTableAction[] = [
  {
    name: 'company',
    action: 'alter',
    columns: [
      {
        columnName: 'accountOwnerId',
        referencedTableName: 'workspaceMember',
        referencedTableColumnName: 'id',
        action: TenantMigrationColumnActionType.RELATION,
      },
    ],
  },
];
