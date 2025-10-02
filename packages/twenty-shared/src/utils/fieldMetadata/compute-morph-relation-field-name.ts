
import { capitalize } from '@/utils/strings';

enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY'
}


type ComputeMorphRelationFieldNameArgs = {
  fieldName: string;
  relationType: RelationType;
  nameSingular: string;
  namePlural: string;
};

export const computeMorphRelationFieldName = ({
  fieldName,
  relationType,
  nameSingular,
  namePlural,
}: ComputeMorphRelationFieldNameArgs): string => {
  if (relationType === RelationType.MANY_TO_ONE) {
    return `${fieldName}${capitalize(nameSingular)}`;
  }

  if (relationType === RelationType.ONE_TO_MANY) {
    return `${fieldName}${capitalize(namePlural)}`;
  }

  throw new Error(
    `Invalid relation direction: ${relationType} for field ${fieldName}`,
  );
};