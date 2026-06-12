import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';

import { isCompositePropertySupportedInGroupBy } from 'src/engine/metadata-modules/field-metadata/utils/is-composite-property-supported-in-group-by.util';

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
