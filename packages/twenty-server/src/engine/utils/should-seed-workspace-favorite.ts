import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const shouldSeedWorkspaceFavorite = (
  // @ts-expect-error legacy noImplicitAny
  objectMetadataId,
  // @ts-expect-error legacy noImplicitAny
  objectMetadataMap,
): boolean =>
  objectMetadataId !==
    objectMetadataMap[STANDARD_OBJECT_IDS.workflowVersion]?.id &&
  objectMetadataId !== objectMetadataMap[STANDARD_OBJECT_IDS.workflowRun]?.id;
