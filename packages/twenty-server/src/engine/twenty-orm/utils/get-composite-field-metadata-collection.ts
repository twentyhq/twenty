import { isCompositeFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-field-metadata-type.util';
import { ObjectMetadataMapItem } from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

export function getCompositeFieldMetadataCollection(
  objectMetadata: ObjectMetadataMapItem,
) {
  const compositeFieldMetadataCollection = Object.values(
    objectMetadata.fields,
  ).filter((fieldMetadata) => isCompositeFieldMetadataType(fieldMetadata.type));

  return compositeFieldMetadataCollection;
}
