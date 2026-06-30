import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

import { getDefaultViewFilterOperand } from 'src/engine/metadata-modules/flat-view-filter/utils/get-default-view-filter-operand.util';

describe('getDefaultViewFilterOperand', () => {
  it('should default select filters to IS', () => {
    expect(
      getDefaultViewFilterOperand({
        fieldType: FieldMetadataType.SELECT,
      }),
    ).toBe(ViewFilterOperand.IS);
  });

  it('should default relation filters without a target field to IS', () => {
    expect(
      getDefaultViewFilterOperand({
        fieldType: FieldMetadataType.RELATION,
      }),
    ).toBe(ViewFilterOperand.IS);
  });

  it('should default relation traversal filters from the target field type', () => {
    expect(
      getDefaultViewFilterOperand({
        fieldType: FieldMetadataType.RELATION,
        relationTargetFieldType: FieldMetadataType.TEXT,
      }),
    ).toBe(ViewFilterOperand.CONTAINS);
  });
});
