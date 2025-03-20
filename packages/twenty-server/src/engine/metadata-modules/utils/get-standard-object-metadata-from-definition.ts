import { WorkspaceEntityMetadataArgs } from 'src/engine/twenty-orm/interfaces/workspace-entity-metadata-args.interface';

import { metadataArgsStorage } from 'src/engine/twenty-orm/storage/metadata-args.storage';
import { standardObjectMetadataDefinitions } from 'src/engine/workspace-manager/workspace-sync-metadata/standard-objects';

const standardObjectMap = new Map<string, WorkspaceEntityMetadataArgs>();

standardObjectMetadataDefinitions.forEach((entity) => {
  const metadata = metadataArgsStorage.filterEntities(entity);

  if (metadata?.standardId) {
    standardObjectMap.set(metadata.standardId, metadata);
  }
});

export const getStandardObjectMetadataFromDefinition = (
  standardId: string,
): WorkspaceEntityMetadataArgs | undefined => {
  return standardObjectMap.get(standardId);
};
