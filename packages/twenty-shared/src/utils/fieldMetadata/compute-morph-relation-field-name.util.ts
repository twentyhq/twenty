
import { capitalize } from '@/utils/strings';

enum RelationType {
  MANY_TO_ONE = 'MANY_TO_ONE',
  ONE_TO_MANY = 'ONE_TO_MANY'
}


type ComputeMorphRelationFieldNameArgs = {
  fieldName: string;
  relationDirection: RelationType;
  nameSingular: string;
  namePlural: string;
};

export const computeMorphRelationFieldName = ({
  fieldName,
  relationDirection,
  nameSingular,
  namePlural,
}: ComputeMorphRelationFieldNameArgs): string => {
  if (relationDirection === RelationType.MANY_TO_ONE) {
    return `${fieldName}${capitalize(nameSingular)}`;
  }

  if (relationDirection === RelationType.ONE_TO_MANY) {
    return `${fieldName}${capitalize(namePlural)}`;
  }

  throw new Error(
    `Invalid relation direction: ${relationDirection} for field ${fieldName}`,
  );
};
