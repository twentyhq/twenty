import { CustomError } from '@/utils/errors';
import { capitalize } from '@/utils/strings';

enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY',
}

type ComputeMorphRelationFieldNameArgs = {
  fieldName: string;
  relationType: RelationType;
  targetObjectMetadataNameSingular: string;
  targetObjectMetadataNamePlural: string;
};

export const computeMorphRelationFieldName = ({
  fieldName,
  relationType,
  targetObjectMetadataNameSingular: nameSingular,
  targetObjectMetadataNamePlural: namePlural,
}: ComputeMorphRelationFieldNameArgs): string => {
  if (relationType === RelationType.MANY_TO_ONE) {
    return `${fieldName}${capitalize(nameSingular)}`;
  }

  if (relationType === RelationType.ONE_TO_MANY) {
    return `${fieldName}${capitalize(namePlural)}`;
  }

  throw new CustomError(
    `Invalid relation type (${relationType}) for field ${fieldName} on ${nameSingular}`,
    'INVALID_RELATION_TYPE_FOR_COMPUTE_MORPH_RELATION_FIELD_NAME',
  );
};
