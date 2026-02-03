import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
