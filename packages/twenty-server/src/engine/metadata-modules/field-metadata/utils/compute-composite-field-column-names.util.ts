import {
  compositeTypeDefinitions,
  type FieldMetadataType,
} from 'twenty-shared/types';

import { PROVISIONED_COMPOSITE_PROPERTIES } from 'src/engine/metadata-modules/field-metadata/constants/provisioned-composite-properties.constant';
import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';

export const computeCompositeFieldColumnNames = ({
  name,
  type,
}: {
  name: string;
  type: FieldMetadataType;
}): string[] =>
  [
    ...(compositeTypeDefinitions.get(type)?.properties ?? []),
    ...(PROVISIONED_COMPOSITE_PROPERTIES[type] ?? []),
  ].map((property) => computeCompositeColumnName(name, property));
