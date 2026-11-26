import { FORMULA_FIELD_METADATA_TYPES } from '@/constants/FormulaFieldMetadataTypes';
import { type FieldMetadataType } from '@/types/FieldMetadataType';
import { type FormulaFieldMetadataType } from '@/types/FormulaFieldMetadataType';

export const isFormulaFieldMetadataType = (
  fieldMetadataType: FieldMetadataType,
): fieldMetadataType is FormulaFieldMetadataType =>
  FORMULA_FIELD_METADATA_TYPES.some(
    (formulaFieldMetadataType) =>
      formulaFieldMetadataType === fieldMetadataType,
  );
