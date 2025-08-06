import { isDefined } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { fromFlatObjectMetadataToFlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-flat-object-metadata-to-flat-object-metadata-with-flat-field-maps.util';

type AddFlatObjectMetadataToFlatObjectMetadataMapsOrThrowArgs = {
  flatObjectMetadata: FlatObjectMetadata;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadata,
  flatObjectMetadataMaps,
}: AddFlatObjectMetadataToFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  if (isDefined(flatObjectMetadataMaps.byId[flatObjectMetadata.id])) {
    throw new Error(
      'addFlatObjectMetadataToFlatObjectMetadataMapsOrThrow: flat object metadata to add already exists',
    );
  }

  return {
    byId: {
      ...flatObjectMetadataMaps.byId,
      [flatObjectMetadata.id]:
        fromFlatObjectMetadataToFlatObjectMetadataWithFlatFieldMaps(
          flatObjectMetadata,
        ),
    },
    idByNameSingular: {
      ...flatObjectMetadataMaps.idByNameSingular,
      [flatObjectMetadata.nameSingular]: flatObjectMetadata.id,
    },
  };
};
