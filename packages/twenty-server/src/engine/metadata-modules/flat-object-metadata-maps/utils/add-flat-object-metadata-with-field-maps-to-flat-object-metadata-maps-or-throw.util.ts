import { isDefined } from 'twenty-shared/utils';

import {
  FlatObjectMetadataMapsException,
  FlatObjectMetadataMapsExceptionCode,
} from 'src/engine/metadata-modules/flat-object-metadata-maps/flat-object-metadata-maps.exception';
import { type FlatObjectMetadataMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-maps.type';
import { type FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';

type AddFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrowArgs =
  {
    flatObjectMetadataWithFlatFieldMaps: FlatObjectMetadataWithFlatFieldMaps;
    flatObjectMetadataMaps: FlatObjectMetadataMaps;
  };
export const addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow =
  ({
    flatObjectMetadataWithFlatFieldMaps,
    flatObjectMetadataMaps,
  }: AddFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrowArgs): FlatObjectMetadataMaps => {
    if (
      isDefined(
        flatObjectMetadataMaps.byId[flatObjectMetadataWithFlatFieldMaps.id],
      )
    ) {
      throw new FlatObjectMetadataMapsException(
        'addFlatObjectMetadataWithFlatFieldMapsToFlatObjectMetadataMapsOrThrow: flat object metadata with fields maps to add already exists',
        FlatObjectMetadataMapsExceptionCode.OBJECT_METADATA_ALREADY_EXISTS,
      );
    }

    return {
      idByUniversalIdentifier: {
        ...flatObjectMetadataMaps.idByUniversalIdentifier,
        [flatObjectMetadataWithFlatFieldMaps.universalIdentifier]:
          flatObjectMetadataWithFlatFieldMaps.id,
      },
      byId: {
        ...flatObjectMetadataMaps.byId,
        [flatObjectMetadataWithFlatFieldMaps.id]:
          flatObjectMetadataWithFlatFieldMaps,
      },
      idByNameSingular: {
        ...flatObjectMetadataMaps.idByNameSingular,
        [flatObjectMetadataWithFlatFieldMaps.nameSingular]:
          flatObjectMetadataWithFlatFieldMaps.id,
      },
    };
  };
