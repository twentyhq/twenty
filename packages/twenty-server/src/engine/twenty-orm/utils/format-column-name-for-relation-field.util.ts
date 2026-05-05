import {
  type FieldMetadataSettingsMapping,
  RelationType,
} from 'twenty-shared/types';
import { computeRelationFieldJoinColumnName } from 'twenty-shared/utils';

export const formatColumnNameForRelationField = (
  fieldName: string,
  fieldMetadataSettings: FieldMetadataSettingsMapping['RELATION'],
): string => {
  if (fieldMetadataSettings.relationType === RelationType.ONE_TO_MANY) {
    throw new Error('No column exists for one to many relation fields');
  }

  if (fieldMetadataSettings.relationType === RelationType.MANY_TO_ONE) {
    return computeRelationFieldJoinColumnName({ name: fieldName });
  }

  return fieldName;
};
