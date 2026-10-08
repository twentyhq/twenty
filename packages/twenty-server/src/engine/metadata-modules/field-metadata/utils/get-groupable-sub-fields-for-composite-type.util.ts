import { isCompositePropertySupportedInGroupBy } from 'twenty-shared/utils';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';

export const getGroupableSubFieldsForCompositeType = (
  type: FieldMetadataType,
): string[] | null => {
  const compositeTypeDefinition = compositeTypeDefinitions.get(type);

  if (!compositeTypeDefinition) {
    return null;
  }

  return compositeTypeDefinition.properties
    .filter(isCompositePropertySupportedInGroupBy)
    .map((property) => property.name);
};
