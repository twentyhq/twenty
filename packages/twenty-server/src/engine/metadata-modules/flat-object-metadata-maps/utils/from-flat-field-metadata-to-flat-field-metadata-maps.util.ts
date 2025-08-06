import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadataWithFlatFieldMaps } from 'src/engine/metadata-modules/flat-object-metadata-maps/types/flat-object-metadata-with-flat-field-metadata-maps.type';
import { fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/utils/from-object-metadata-item-with-field-maps-to-flat-object-metadata.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

type FromObjectMetadataItemWithFieldMapsToFlatObjectWithFlatFieldMetadataMapsArgs =
  {
    objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
    objectMetadataMaps: ObjectMetadataMaps;
  };
export const fromObjectMetadataItemWithFieldMapsToFlatObjectWithFlatFieldMetadataMaps =
  ({
    objectMetadataItemWithFieldMaps,
    objectMetadataMaps,
  }: FromObjectMetadataItemWithFieldMapsToFlatObjectWithFlatFieldMetadataMapsArgs): FlatObjectMetadataWithFlatFieldMaps => {
    const flatObjectMetadata =
      fromObjectMetadataItemWithFieldMapsToFlatObjectMetadata({
        objectMetadataItemWithFieldMaps,
        objectMetadataMaps,
      });

    const initialAccumulator: Record<string, FlatFieldMetadata> = {};

    const fieldsById = flatObjectMetadata.flatFieldMetadatas.reduce(
      (acc, flatFieldMetadata) => ({
        ...acc,
        [flatFieldMetadata.id]: flatFieldMetadata,
      }),
      initialAccumulator,
    );

    const { fieldIdByJoinColumnName, fieldIdByName } =
      objectMetadataItemWithFieldMaps;

    return {
      ...flatObjectMetadata,
      fieldsById,
      fieldIdByJoinColumnName,
      fieldIdByName,
    };
  };
