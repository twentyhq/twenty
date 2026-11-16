import {
  type ComputedFieldValueType,
  FieldMetadataType,
} from 'twenty-shared/types';
import { ComputedFieldExpressionError, isDefined } from 'twenty-shared/utils';

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

export const getComputedFieldValueTypeOrThrow = ({
  columnType,
  readablePath,
}: {
  columnType: FieldMetadataType;
  readablePath: string;
}): ComputedFieldValueType => {
  const valueType = VALUE_TYPE_BY_COLUMN_TYPE[columnType];

  if (!isDefined(valueType)) {
    throw new ComputedFieldExpressionError(
      `"${readablePath}" is of a type (${columnType}) that expressions cannot read`,
    );
  }

  return valueType;
};
