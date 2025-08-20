import { isDefined } from 'twenty-shared/utils';

import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { findFlatObjectMetadataInFlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/utils/find-flat-object-metadata-in-flat-object-metadata-maps.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type FindFlatObjectMetadataInFlatObjectMetadataMapsArgs = {
  objectMetadataId: string;
  flatObjectMetadataMaps: FlatObjectMetadataMaps;
};
export const findFlatObjectMetadataInFlatObjectMetadataMapsOrThrow = ({
  flatObjectMetadataMaps,
  objectMetadataId,
}: FindFlatObjectMetadataInFlatObjectMetadataMapsArgs): FlatObjectMetadata => {
  const flatObjectMetadata = findFlatObjectMetadataInFlatObjectMetadataMaps({
    flatObjectMetadataMaps,
    objectMetadataId,
  });

  if (!isDefined(flatObjectMetadata)) {
    throw new FlatObjectMetadataMapsException(
      'flat object metadata not found in flat object metadata maps',
      FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_NOT_FOUND,
    );
  }

  return flatObjectMetadata;
};
