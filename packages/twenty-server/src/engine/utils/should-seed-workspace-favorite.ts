import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const shouldSeedWorkspaceFavorite = (
  objectMetadataId,
  objectMetadataMap,
): boolean =>
  objectMetadataId !==
    objectMetadataMap[STANDARD_OBJECT_IDS.workflowVersion]?.id &&
  objectMetadataId !== objectMetadataMap[STANDARD_OBJECT_IDS.workflowRun]?.id;
