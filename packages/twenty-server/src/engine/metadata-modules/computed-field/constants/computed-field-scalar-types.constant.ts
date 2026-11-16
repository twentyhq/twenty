import { FieldMetadataType } from 'twenty-shared/types';

// Single-column types: the value of a formula or rollup is cast to the column type of its field
export const COMPUTED_FIELD_SCALAR_TYPES = [
  FieldMetadataType.NUMBER,
  FieldMetadataType.TEXT,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.DATE,
  FieldMetadataType.DATE_TIME,
] as const satisfies FieldMetadataType[];
