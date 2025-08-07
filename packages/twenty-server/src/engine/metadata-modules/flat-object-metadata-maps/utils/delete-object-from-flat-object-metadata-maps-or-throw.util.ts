import { isDefined, removePropertiesFromRecord } from 'twenty-shared/utils';

import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';

export type DeleteObjectFromFlatObjectMetadataMapsOrThrowArgs = {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const deleteObjectFromFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadataMaps,
  objectMetadataId,
}: DeleteObjectFromFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
  if (!isDefined(flatObjectMetadataMaps.byId[objectMetadataId])) {
    throw new FlatObjectMetadataMapsException(
      'deleteObjectFromFlatObjectMetadataMapsOrThrow: object to delete not found',
      FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
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
