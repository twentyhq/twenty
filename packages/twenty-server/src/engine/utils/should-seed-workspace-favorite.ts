import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';

export const shouldSeedWorkspaceFavorite = (
  objectMetadataId: string,
  objectMetadataItems: ObjectMetadataEntity[],
): boolean =>
  objectMetadataId !==
    objectMetadataItems.find(
      (item) =>
        item.universalIdentifier ===
        STANDARD_OBJECTS.workflowVersion.universalIdentifier,
    )?.id &&
  objectMetadataId !==
    objectMetadataItems.find(
      (item) =>
        item.universalIdentifier ===
        STANDARD_OBJECTS.workflowRun.universalIdentifier,
    )?.id;
