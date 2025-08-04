import { removePropertiesFromRecord } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

type DeleteObjectFromFlatObjectMetadataMapsArgs = {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const deleteObjectFromFlatObjectMetadataMaps = ({
  flatObjectMetadataMaps,
  objectMetadataId,
}: DeleteObjectFromFlatObjectMetadataMapsArgs): FlatObjectMetadataMaps => {
  const updatedIdByNameSingularEntries = Object.entries(
    flatObjectMetadataMaps.idByNameSingular,
  ).filter(([id]) => id !== objectMetadataId);

  return {
    byId: removePropertiesFromRecord(flatObjectMetadataMaps.byId, [
      objectMetadataId,
    ]),
    idByNameSingular: Object.fromEntries(updatedIdByNameSingularEntries),
  };
};
