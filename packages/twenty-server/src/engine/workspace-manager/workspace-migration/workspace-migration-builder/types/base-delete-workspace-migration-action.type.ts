import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { type AllMetadataName } from 'twenty-shared/metadata';

export type BaseDeleteWorkspaceMigrationAction<T extends AllMetadataName> = {
  universalIdentifier: string;
  type: typeof WORKSPACE_MIGRATION_ACTION_TYPE.delete;
  metadataName: T;
};
