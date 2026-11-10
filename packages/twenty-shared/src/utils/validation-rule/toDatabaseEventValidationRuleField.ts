import { FieldMetadataType } from '@/types/FieldMetadataType';
import { RelationType } from '@/types/RelationType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';
import { computeRelationGqlFieldJoinColumnName } from '@/utils/fieldMetadata/compute-relation-gql-field-join-column-name';

// An event carries a relation as its join column (companyId), never the related record
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

  if (relationType !== RelationType.MANY_TO_ONE) {
    return undefined;
  }

  return {
    name: computeRelationGqlFieldJoinColumnName({ name }),
    type: FieldMetadataType.UUID,
    universalIdentifier,
  };
};
