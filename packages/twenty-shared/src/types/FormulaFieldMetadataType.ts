import { type FORMULA_FIELD_METADATA_TYPES } from '@/constants/FormulaFieldMetadataTypes';

export type FormulaFieldMetadataType =
  (typeof FORMULA_FIELD_METADATA_TYPES)[number];
