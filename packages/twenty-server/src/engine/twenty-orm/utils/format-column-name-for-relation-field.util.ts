import {
  type FieldMetadataRelationSettings,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const formatColumnNameForRelationField = (
  fieldName: string,
  fieldMetadataSettings: FieldMetadataRelationSettings,
): string => {
  if (fieldMetadataSettings.relationType === RelationType.MANY_TO_ONE) {
    if (!isDefined(fieldMetadataSettings.joinColumnName)) {
      throw new Error(`Join column name is not defined for field ${fieldName}`);
    }

    return fieldMetadataSettings.joinColumnName;
  }

  return fieldName;
};
