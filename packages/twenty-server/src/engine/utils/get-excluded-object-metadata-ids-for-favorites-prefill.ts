import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const getExcludedObjectMetadataIdsForFavoritesPrefill = (
  objectMetadataMap,
) => [
  objectMetadataMap[STANDARD_OBJECT_IDS.workflowVersion].id,
  objectMetadataMap[STANDARD_OBJECT_IDS.workflowRun].id,
];
