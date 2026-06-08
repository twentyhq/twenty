import { FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY } from '@/constants';
import { type FieldMetadataType } from '@/types';
import { isFieldMetadataDateKind } from '@/utils/fieldMetadata/isFieldMetadataDateKind';
import { shouldExcludeFieldFromAgentToolSchema } from '@/utils/fieldMetadata/shouldExcludeFieldFromAgentToolSchema';

const ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
]);

export const isFieldMetadataSupportedInGroupBy = ({
  type,
  name,
  isSystem,
}: {
  type: FieldMetadataType;
  name: string;
  isSystem: boolean;
}): boolean => {
  const isAlwaysGroupableSystemDateField =
    ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES.has(name) &&
    isFieldMetadataDateKind(type);

  if (
    !isAlwaysGroupableSystemDateField &&
    shouldExcludeFieldFromAgentToolSchema({ fieldName: name, isSystem })
  ) {
    return false;
  }

  return !FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY.has(type);
};
