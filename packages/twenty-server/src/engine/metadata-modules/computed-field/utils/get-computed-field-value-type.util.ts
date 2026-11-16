import { FieldMetadataType } from 'twenty-shared/types';

import { ComputedFieldExpressionException } from 'src/engine/metadata-modules/computed-field/exceptions/computed-field.exception';
import { type ComputedFieldValueType } from 'src/engine/metadata-modules/computed-field/types/computed-field-value-type.type';

const VALUE_TYPE_BY_COLUMN_TYPE: Partial<
  Record<FieldMetadataType, ComputedFieldValueType>
> = {
  [FieldMetadataType.NUMBER]: FieldMetadataType.NUMBER,
  [FieldMetadataType.NUMERIC]: FieldMetadataType.NUMBER,
  [FieldMetadataType.POSITION]: FieldMetadataType.NUMBER,
  [FieldMetadataType.BOOLEAN]: FieldMetadataType.BOOLEAN,
  [FieldMetadataType.DATE]: FieldMetadataType.DATE,
  [FieldMetadataType.DATE_TIME]: FieldMetadataType.DATE_TIME,
  [FieldMetadataType.TEXT]: FieldMetadataType.TEXT,
  [FieldMetadataType.UUID]: FieldMetadataType.TEXT,
  [FieldMetadataType.SELECT]: FieldMetadataType.TEXT,
  [FieldMetadataType.RATING]: FieldMetadataType.TEXT,
};

// The type an expression sees for a column; lists, JSON and search vectors have no scalar value
export const getComputedFieldValueType = ({
  columnType,
  readablePath,
}: {
  columnType: FieldMetadataType;
  readablePath: string;
}): ComputedFieldValueType => {
  const valueType = VALUE_TYPE_BY_COLUMN_TYPE[columnType];

  if (valueType === undefined) {
    throw new ComputedFieldExpressionException(
      `"${readablePath}" is of a type (${columnType}) that expressions cannot read`,
    );
  }

  return valueType;
};
