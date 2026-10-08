import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { ViewFilterExceptionCode } from 'src/engine/metadata-modules/view-filter/exceptions/view-filter.exception';
import { getIncompatibleViewFilterOperandError } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/validators/utils/get-incompatible-view-filter-operand-error.util';

describe('getIncompatibleViewFilterOperandError', () => {
  it('should return undefined when the operand is supported by the field type', () => {
    expect(
      getIncompatibleViewFilterOperandError({
        operand: ViewFilterOperand.CONTAINS,
        fieldType: FieldMetadataType.TEXT,
        subFieldName: null,
        relationTargetFieldType: undefined,
      }),
    ).toBeUndefined();
  });

  it('should return an error when the operand is not supported by the field type', () => {
    const error = getIncompatibleViewFilterOperandError({
      operand: ViewFilterOperand.IS_IN_PAST,
      fieldType: FieldMetadataType.TEXT,
      subFieldName: null,
      relationTargetFieldType: undefined,
    });

    expect(error?.code).toBe(ViewFilterExceptionCode.INVALID_VIEW_FILTER_DATA);
    expect(error?.message).toContain(ViewFilterOperand.IS_IN_PAST);
  });

  it('should list the supported operands in the error message', () => {
    const error = getIncompatibleViewFilterOperandError({
      operand: ViewFilterOperand.IS_IN_PAST,
      fieldType: FieldMetadataType.TEXT,
      subFieldName: null,
      relationTargetFieldType: undefined,
    });

    expect(error?.message).toContain(ViewFilterOperand.CONTAINS);
  });

  it('should resolve the effective field type through the relation target', () => {
    const error = getIncompatibleViewFilterOperandError({
      operand: ViewFilterOperand.IS_IN_PAST,
      fieldType: FieldMetadataType.RELATION,
      subFieldName: null,
      relationTargetFieldType: FieldMetadataType.DATE_TIME,
    });

    expect(error).toBeUndefined();
  });
});
