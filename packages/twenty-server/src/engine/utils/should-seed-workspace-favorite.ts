import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

export const shouldSeedWorkspaceFavorite = (
  objectMetadataId: string,
  objectMetadataItems: ObjectMetadataEntity[],
): boolean =>
  objectMetadataId !==
    objectMetadataItems.find(
      (item) => item.standardId === STANDARD_OBJECT_IDS.workflowVersion,
    )?.id &&
  objectMetadataId !==
    objectMetadataItems.find(
      (item) => item.standardId === STANDARD_OBJECT_IDS.workflowRun,
    )?.id;
