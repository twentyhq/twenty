import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';
import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';

import { isGatedAndNotEnabled } from './is-gate-and-not-enabled.util';

export const shouldExcludeFromWorkspaceApi = (
  objectMetadataItem: { standardId?: string | null | undefined },
  standardObjectMetadataDefinitions: (typeof BaseWorkspaceEntity)[],
  workspaceFeatureFlagsMap: Record<string, boolean>,
): boolean => {
  const workspaceEntity = standardObjectMetadataDefinitions.find((entity) => {
    const entityMetadata = metadataArgsStorage.filterEntities(entity);

    return entityMetadata?.standardId === objectMetadataItem.standardId;
  });

  if (!workspaceEntity) {
    return false; // Don't exclude non-workspace entities
  }

  const entityMetadata = metadataArgsStorage.filterEntities(workspaceEntity);

  return isGatedAndNotEnabled(
    entityMetadata?.gate,
    workspaceFeatureFlagsMap,
    'workspaceApi',
  );
};
