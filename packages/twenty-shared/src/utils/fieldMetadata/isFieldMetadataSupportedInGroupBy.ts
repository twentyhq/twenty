import { FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY } from '@/constants';
import { FieldMetadataType, RelationType } from '@/types';
import { isFieldMetadataDateKind } from '@/utils/fieldMetadata/isFieldMetadataDateKind';
import { shouldExcludeFieldFromAgentToolSchema } from '@/utils/fieldMetadata/shouldExcludeFieldFromAgentToolSchema';

const ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
]);

const ALWAYS_GROUPABLE_SYSTEM_ACTOR_FIELD_NAMES = new Set([
  'createdBy',
  'updatedBy',
]);

const RELATION_FIELD_METADATA_TYPES = new Set<FieldMetadataType>([
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
]);

export const isFieldMetadataSupportedInGroupBy = ({
  type,
  name,
  isSystem,
  relationType,
}: {
  type: FieldMetadataType;
  name: string;
  isSystem: boolean;
  relationType?: RelationType | null;
}): boolean => {
  const isAlwaysGroupableSystemField =
    (ALWAYS_GROUPABLE_SYSTEM_DATE_FIELD_NAMES.has(name) &&
      isFieldMetadataDateKind(type)) ||
    (ALWAYS_GROUPABLE_SYSTEM_ACTOR_FIELD_NAMES.has(name) &&
      type === FieldMetadataType.ACTOR);

  if (
    !isAlwaysGroupableSystemField &&
    shouldExcludeFieldFromAgentToolSchema({ fieldName: name, isSystem })
  ) {
    return false;
  }

  if (
    RELATION_FIELD_METADATA_TYPES.has(type) &&
    relationType === RelationType.ONE_TO_MANY
  ) {
    return false;
  }

  return !FIELD_METADATA_TYPES_NOT_SUPPORTED_IN_GROUP_BY.has(type);
};
