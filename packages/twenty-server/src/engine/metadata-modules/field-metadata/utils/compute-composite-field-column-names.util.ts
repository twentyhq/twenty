import { type FieldMetadataType } from 'twenty-shared/types';

import { computeCompositeColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-column-name.util';
import { getCompositePropertiesWithColumns } from 'src/engine/metadata-modules/field-metadata/utils/get-composite-properties-with-columns.util';

export const computeCompositeFieldColumnNames = ({
  name,
  type,
}: {
  name: string;
  type: FieldMetadataType;
}): string[] =>
  getCompositePropertiesWithColumns(type).map((property) =>
    computeCompositeColumnName(name, property),
  );
