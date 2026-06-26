import { DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildJunctionObjectByNameSingular = (
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>,
): Map<string, FlatObjectMetadata> => {
  const junctionObjectByNameSingular = new Map<string, FlatObjectMetadata>();

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )) {
    if (
      isDefined(flatObjectMetadata) &&
      (DEFAULT_RELATIONS_OBJECTS_STANDARD_IDS as readonly string[]).includes(
        flatObjectMetadata.nameSingular,
      )
    ) {
      junctionObjectByNameSingular.set(
        flatObjectMetadata.nameSingular,
        flatObjectMetadata,
      );
    }
  }

  return junctionObjectByNameSingular;
};
