import { TenantMigrationTableAction } from 'src/metadata/tenant-migration/tenant-migration.entity';

export const addWorkspaceMemberSettingTable: TenantMigrationTableAction[] = [
  {
    name: 'workspaceMemberSetting',
    action: 'create',
  },
  {
    name: 'workspaceMemberSetting',
    action: 'alter',
    columns: [],
  },
];
