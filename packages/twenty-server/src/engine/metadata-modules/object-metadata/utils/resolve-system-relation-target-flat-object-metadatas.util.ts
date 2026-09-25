import {
  DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { OPTIONAL_DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'src/engine/metadata-modules/object-metadata/constants/optional-default-relations-object-standard-ids.constant';
import { type StandardTargetFlatObjectMetadataByNameSingular } from 'src/engine/metadata-modules/object-metadata/utils/build-system-relation-flat-field-metadatas-for-object.util';

type DefaultRelationStandardObjectNameSingular =
  (typeof DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS)[number];

// A default relation object must exist for an object to be created, but an
// optional one is provisioned by its own upgrade command, which also backfills
// the objects created before it ran, so its absence must not block creation.
export const resolveSystemRelationTargetFlatObjectMetadatas = ({
  flatObjectMetadataMaps,
}: Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'>): {
  standardTargetFlatObjectMetadataByNameSingular: StandardTargetFlatObjectMetadataByNameSingular;
  missingDefaultRelationObjectNameSingulars: DefaultRelationStandardObjectNameSingular[];
} => {
  const standardTargetFlatObjectMetadataByNameSingular: StandardTargetFlatObjectMetadataByNameSingular =
    {};
  const missingDefaultRelationObjectNameSingulars: DefaultRelationStandardObjectNameSingular[] =
    [];

  for (const nameSingular of DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS[nameSingular].universalIdentifier
      ];

    if (!isDefined(flatObjectMetadata)) {
      missingDefaultRelationObjectNameSingulars.push(nameSingular);
      continue;
    }

    standardTargetFlatObjectMetadataByNameSingular[nameSingular] =
      flatObjectMetadata;
  }

  for (const nameSingular of OPTIONAL_DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS) {
    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        STANDARD_OBJECTS[nameSingular].universalIdentifier
      ];

    if (isDefined(flatObjectMetadata)) {
      standardTargetFlatObjectMetadataByNameSingular[nameSingular] =
        flatObjectMetadata;
    }
  }

  return {
    standardTargetFlatObjectMetadataByNameSingular,
    missingDefaultRelationObjectNameSingulars,
  };
};
