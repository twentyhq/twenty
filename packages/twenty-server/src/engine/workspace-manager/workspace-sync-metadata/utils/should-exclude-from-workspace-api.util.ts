import { type BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { isGatedAndNotEnabled } from 'src/engine/workspace-manager/workspace-sync-metadata/utils/is-gate-and-not-enabled.util';

export const shouldExcludeFromWorkspaceApi = (
  objectMetadataItem: { standardId?: string | null | undefined },
  standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
  workspaceFeatureFlagsMap: Record<string, boolean>,
): boolean => {
  const entityMetadata = standardObjectMetadataDefinitions
    .map((entity) => metadataArgsStorage.filterEntities(entity))
    .find((meta) => meta?.standardId === objectMetadataItem.standardId);

  if (!entityMetadata) {
    return false; // Don't exclude non-workspace entities
  }

  return isGatedAndNotEnabled(
    entityMetadata?.gate,
    workspaceFeatureFlagsMap,
    'workspaceApi',
  );
};
