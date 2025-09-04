import { type FieldMetadataType } from 'twenty-shared/types';

import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';

export const areFieldMetadatasOfType = <T extends FieldMetadataType>(
  fieldMetadatas: FieldMetadataEntity[],
  fieldMetadataType: T,
): fieldMetadatas is Array<FieldMetadataEntity & FieldMetadataEntity<T>> =>
  fieldMetadatas.every((fieldMetadata) =>
    isFlatFieldMetadataOfType(fieldMetadata, fieldMetadataType),
  );
