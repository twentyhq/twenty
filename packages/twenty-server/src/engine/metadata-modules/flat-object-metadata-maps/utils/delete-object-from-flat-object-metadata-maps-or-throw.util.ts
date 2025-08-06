import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

type DeleteObjectFromFlatObjectMetadataMapsOrThrowArgs = {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const deleteObjectFromFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadataMaps,
  objectMetadataId,
}: DeleteObjectFromFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  if (!isDefined(flatObjectMetadataMaps.byId[objectMetadataId])) {
    throw new Error(
      'deleteObjectFromFlatObjectMetadataMapsOrThrow: object to delete does not exist',
    );
  }

  const updatedIdByNameSingularEntries = Object.entries(
    flatObjectMetadataMaps.idByNameSingular,
  ).filter(([_nameSingular, id]) => id !== objectMetadataId);

  return {
    byId: removePropertiesFromRecord(flatObjectMetadataMaps.byId, [
      objectMetadataId,
    ]),
    idByNameSingular: Object.fromEntries(updatedIdByNameSingularEntries),
  };
};
