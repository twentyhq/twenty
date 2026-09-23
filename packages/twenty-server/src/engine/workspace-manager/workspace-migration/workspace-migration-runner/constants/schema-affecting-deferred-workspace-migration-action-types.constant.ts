import { type WorkspaceMigrationActionType } from 'src/engine/metadata-modules/flat-entity/types/metadata-workspace-migration-action.type';

// A deferred action of this type builds workspace schema objects, so a
// migration running beside it can deadlock with it.
export const SCHEMA_AFFECTING_DEFERRED_WORKSPACE_MIGRATION_ACTION_TYPES = [
  'create',
] as const satisfies readonly WorkspaceMigrationActionType[];
