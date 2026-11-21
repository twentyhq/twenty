import { type AllMetadataName } from 'twenty-shared/metadata';

import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNamesForValidation } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names-for-validation.util';

export const getMetadataDependencyFlatEntityMapsKeys = (
  metadataNames: readonly AllMetadataName[],
) =>
  [
    ...new Set(
      metadataNames.flatMap((metadataName) => [
        metadataName,
        ...getMetadataRelatedMetadataNamesForValidation(metadataName),
      ]),
    ),
  ].map(getMetadataFlatEntityMapsKey);
