import { FieldMetadataInterface } from 'src/metadata/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/metadata/field-metadata/field-metadata.entity';
import { isCompositeFieldMetadataType } from 'src/metadata/field-metadata/utils/is-composite-field-metadata-type.util';
import { BasicFieldMetadataType } from 'src/metadata/workspace-migration/factories/basic-column-action.factory';

import { computeCustomName } from './compute-custom-name.util';

export const computeFieldTargetColumn = (
  fieldMetadata:
    | FieldMetadataEntity<BasicFieldMetadataType>
    | FieldMetadataInterface<BasicFieldMetadataType>,
) => {
  if (isCompositeFieldMetadataType(fieldMetadata.type)) {
    throw new Error(
      "Composite field metadata should not be computed here, as they're split into multiple fields.",
    );
  }

  return computeCustomName(fieldMetadata.name, fieldMetadata.isCustom ?? false);
};
