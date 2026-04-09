import { FieldMetadataType } from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';

const NON_GROUPABLE_FIELD_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.TS_VECTOR,
  FieldMetadataType.RAW_JSON,
  FieldMetadataType.FILES,
  FieldMetadataType.POSITION,
]);

const ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
]);

export const isFlatFieldMetadataSupportedInGroupBy = (
  fieldMetadata: FlatFieldMetadata,
): boolean => {
  const isAlwaysGroupableSystemDateField =
    ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES.has(fieldMetadata.name) &&
    isFieldMetadataDateKind(fieldMetadata.type);

  if (
    !isAlwaysGroupableSystemDateField &&
    shouldExcludeFieldFromAgentToolSchema(fieldMetadata)
  ) {
    return false;
  }

  return !NON_GROUPABLE_FIELD_TYPES.has(fieldMetadata.type);
};
