import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { SelectFieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/services/field-metadata-related-records.service';
import { FieldMetadataType } from 'twenty-shared/types';
export const isSelectFieldMetadata = (
  fieldMetadata: FieldMetadataEntity,
  // @ts-expect-error Ignore from now
): fieldMetadata is SelectFieldMetadataEntity => {
  return fieldMetadata.type === FieldMetadataType.SELECT;
};
