import {
  type CompositeProperty,
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME } from 'src/engine/metadata-modules/field-metadata/constants/composite-properties-provisioned-ahead-of-runtime.constant';

export const getCompositeColumnProperties = (
  fieldType: FieldMetadataType,
): CompositeProperty[] => [
  ...(compositeTypeDefinitions.get(fieldType)?.properties ?? []),
  ...(COMPOSITE_PROPERTIES_PROVISIONED_AHEAD_OF_RUNTIME[fieldType] ?? []),
];
