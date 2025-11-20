import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';

import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

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
