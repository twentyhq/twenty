import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { camelCase } from 'src/utils/camel-case';

// Compute composite field metadata by combining the composite field metadata with the field metadata
export const computeCompositeFieldMetadata = (
  compositeFieldMetadata: FieldMetadataInterface,
  fieldMetadata: FieldMetadataEntity,
): FieldMetadataEntity => ({
  ...fieldMetadata,
  ...compositeFieldMetadata,
  objectMetadataId: fieldMetadata.objectMetadataId,
  name: camelCase(`${fieldMetadata.name}-${compositeFieldMetadata.name}`),
});
