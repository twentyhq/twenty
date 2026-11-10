import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { computeRelationGqlFieldJoinColumnName } from '@/utils/fieldMetadata/compute-relation-gql-field-join-column-name';

// Events carry a relation as its join column (companyId); morph join columns are per target, so they are left out
export const toDatabaseEventValidationRuleField = ({
  name,
  type,
  universalIdentifier,
  relationType,
}: {
  name: string;
  type: FieldMetadataType;
  universalIdentifier: string;
  relationType?: RelationType;
}): ValidationRuleFieldDescriptor | undefined => {
  if (
    type !== FieldMetadataType.RELATION &&
    type !== FieldMetadataType.MORPH_RELATION
  ) {
    return { name, type, universalIdentifier };
  }

  if (
    type === FieldMetadataType.MORPH_RELATION ||
    relationType !== RelationType.MANY_TO_ONE
  ) {
    return undefined;
  }

  return {
    name: computeRelationGqlFieldJoinColumnName({ name }),
    type: FieldMetadataType.UUID,
    universalIdentifier,
  };
};
