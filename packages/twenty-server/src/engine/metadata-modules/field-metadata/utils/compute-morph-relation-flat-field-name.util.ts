import { RelationType } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';

import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';

type ComputeMorphRelationFlatFieldNameArgs = {
  fieldName: string;
  relationType: RelationType;
  targetObjectMetadataNameSingular: string;
  targetObjectMetadataNamePlural: string;
};

export const computeMorphRelationFlatFieldName = ({
  fieldName,
  relationType,
  targetObjectMetadataNameSingular: nameSingular,
  targetObjectMetadataNamePlural: namePlural,
}: ComputeMorphRelationFlatFieldNameArgs): string => {
  if (relationType === RelationType.MANY_TO_ONE) {
    return `${fieldName}${capitalize(nameSingular)}`;
  }

  if (relationType === RelationType.ONE_TO_MANY) {
    return `${fieldName}${capitalize(namePlural)}`;
  }

  throw new FieldMetadataException(
    `Invalid relation type (${relationType}) for field ${fieldName} on ${nameSingular}`,
    FieldMetadataExceptionCode.INVALID_FIELD_INPUT,
  );
};
