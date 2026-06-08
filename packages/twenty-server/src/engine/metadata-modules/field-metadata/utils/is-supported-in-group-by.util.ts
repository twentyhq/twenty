import { FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';

const ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
]);

export const isFlatFieldMetadataSupportedInGroupBy = ({
  fieldMetadataType,
  fieldMetadataName,
  fieldMetadataIsSystem,
}: {
  fieldMetadataType: FieldMetadataType;
  fieldMetadataName: string;
  fieldMetadataIsSystem: boolean;
}): boolean => {
  const isAlwaysGroupableSystemDateField =
    ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES.has(fieldMetadataName) &&
    isFieldMetadataDateKind(fieldMetadataType);

  if (
    !isAlwaysGroupableSystemDateField &&
    shouldExcludeFieldFromAgentToolSchema({
      fieldName: fieldMetadataName,
      isSystem: fieldMetadataIsSystem,
    })
  ) {
    return false;
  }

  return !FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY.has(fieldMetadataType);
};
