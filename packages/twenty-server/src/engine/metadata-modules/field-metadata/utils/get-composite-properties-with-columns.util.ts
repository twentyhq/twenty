import {
  type CompositeProperty,
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { PROVISIONED_COMPOSITE_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/provisioned-composite-properties.constant';

export const getCompositePropertiesWithColumns = (
  type: FieldMetadataType,
): CompositeProperty[] => [
  ...(compositeTypeDefinitions.get(type)?.properties ?? []),
  ...(PROVISIONED_COMPOSITE_PROPERTIES[type] ?? []),
];
