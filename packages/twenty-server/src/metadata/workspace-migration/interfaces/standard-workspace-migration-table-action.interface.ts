import { WorkspaceMigrationTableAction } from 'src/metadata/workspace-migration/workspace-migration.entity';

export type StandardWorkspaceMigrationTableAction = Omit<
  WorkspaceMigrationTableAction,
  'schemaName'
>;
