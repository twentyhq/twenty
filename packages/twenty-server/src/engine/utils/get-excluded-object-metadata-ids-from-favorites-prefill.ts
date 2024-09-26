import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const getExcludedObjectMetadataIdsFromFavoritesPrefill = (
  objectMetadataMap,
) => [
  objectMetadataMap[STANDARD_OBJECT_IDS.workflowVersion].id,
  objectMetadataMap[STANDARD_OBJECT_IDS.workflowRun].id,
];
