import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

export function getCompositeFieldMetadataCollection(
  ObjectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps,
) {
  const compositeFieldMetadataCollection = Object.values(
    ObjectMetadataItemWithFieldMaps.fieldsById,
  ).filter((fieldMetadataItem) =>
    isCompositeFieldMetadataType(fieldMetadataItem.type),
  );

  return compositeFieldMetadataCollection;
}
