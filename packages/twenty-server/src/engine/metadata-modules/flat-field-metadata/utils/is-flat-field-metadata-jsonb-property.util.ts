import { FLAT_FIELD_METADATA_JSONB_PROPERTIES } from 'src/engine/metadata-modules/flat-field-metadata/constants/flat-field-metadata-jsonb-properties.constant';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataEntityOfTypes } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-types.util';
import { FieldMetadataType } from 'twenty-shared/types';

export const isFlatFieldMetadataJsonbProperty = ({
  flatFieldMetadata,
  property,
}: {
  flatFieldMetadata: FlatFieldMetadata;
  property: keyof FlatFieldMetadata;
}): boolean => {
  if (property === 'defaultValue') {
    return isFlatFieldMetadataEntityOfTypes(flatFieldMetadata, [
      FieldMetadataType.LINKS,
      FieldMetadataType.PHONES,
      FieldMetadataType.EMAILS,
      FieldMetadataType.CURRENCY,
      FieldMetadataType.FULL_NAME,
      FieldMetadataType.ADDRESS,
      FieldMetadataType.MULTI_SELECT,
      FieldMetadataType.RAW_JSON,
      FieldMetadataType.ACTOR,
      FieldMetadataType.ARRAY,
    ]);
  }

  const isJsonB = FLAT_FIELD_METADATA_JSONB_PROPERTIES.includes(
    property as (typeof FLAT_FIELD_METADATA_JSONB_PROPERTIES)[number],
  );
  return isJsonB;
};
