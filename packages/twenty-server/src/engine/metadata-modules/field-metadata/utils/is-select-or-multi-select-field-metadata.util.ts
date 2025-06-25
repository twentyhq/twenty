import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export type SelectOrMultiSelectFieldMetadataEntity = FieldMetadataEntity<
  FieldMetadataType.SELECT | FieldMetadataType.MULTI_SELECT
>;
export const isSelectOrMultiSelectFieldMetadata = (
  fieldMetadata: FieldMetadataInterface,
): fieldMetadata is SelectOrMultiSelectFieldMetadataEntity => {
  return [FieldMetadataType.SELECT, FieldMetadataType.MULTI_SELECT].includes(
    fieldMetadata.type,
  );
};
