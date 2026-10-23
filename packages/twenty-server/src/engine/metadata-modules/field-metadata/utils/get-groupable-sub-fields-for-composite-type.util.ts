import {
  isCompositePropertySupportedInGroupBy,
  isDefined,
} from 'twenty-shared/utils';
import {
  compositeTypeDefinitions,
  FieldMetadataType,
} from 'twenty-shared/types';

export const getGroupableSubFieldsForCompositeType = (
  type: FieldMetadataType,
  { excludeDeprecated = false }: { excludeDeprecated?: boolean } = {},
): string[] | null => {
  const compositeTypeDefinition = compositeTypeDefinitions.get(type);

  if (!compositeTypeDefinition) {
    return null;
  }

  return compositeTypeDefinition.properties
    .filter(
      (property) =>
        isCompositePropertySupportedInGroupBy(property) &&
        !(excludeDeprecated && isDefined(property.deprecationReason)),
    )
    .map((property) => property.name);
};
