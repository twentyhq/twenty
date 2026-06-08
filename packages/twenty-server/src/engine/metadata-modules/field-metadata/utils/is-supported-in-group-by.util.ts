import { FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY } from 'twenty-shared/constants';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import { shouldExcludeFieldFromAgentToolSchema } from 'src/engine/metadata-modules/field-metadata/utils/should-exclude-field-from-agent-tool-schema.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

const ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
]);

export const isFlatFieldMetadataSupportedInGroupBy = ({
  type,
  name,
  isSystem,
}: Pick<FlatFieldMetadata, 'type' | 'name' | 'isSystem'>): boolean => {
  const isAlwaysGroupableSystemDateField =
    ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES.has(name) &&
    isFieldMetadataDateKind(type);

  if (
    !isAlwaysGroupableSystemDateField &&
    shouldExcludeFieldFromAgentToolSchema({
      fieldName: name,
      isSystem,
    })
  ) {
    return false;
  }

  return !FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY.has(type);
};
