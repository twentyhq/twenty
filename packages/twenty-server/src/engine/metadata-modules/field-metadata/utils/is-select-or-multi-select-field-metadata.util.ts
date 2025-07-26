import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type SelectOrMultiSelectFieldMetadataEntity = FieldMetadataEntity<
  FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT
>;
export const isSelectOrMultiSelectFieldMetadata = (
  fieldMetadata: FieldMetadataEntity,
): fieldMetadata is FieldMetadataEntity &
  SelectOrMultiSelectFieldMetadataEntity => {
  return [FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT].includes(
    fieldMetadata.type,
  );
};
