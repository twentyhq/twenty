import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type SelectOrMultiSelectFieldMetadataEntity = FieldMetadataEntity<
  FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT
>;
export const isSelectOrMultiSelectFieldMetadata = (
  fieldMetadata: unknown,
): fieldMetadata is SelectOrMultiSelectFieldMetadataEntity => {
  if (!(fieldMetadata instanceof FieldMetadataEntity)) {
    return false;
  }

  return [FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT].includes(
    fieldMetadata.type,
  );
};
