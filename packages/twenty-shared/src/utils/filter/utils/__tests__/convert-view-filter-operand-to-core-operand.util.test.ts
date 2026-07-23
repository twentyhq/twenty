import { ViewFilterOperand } from '@/types';
import { convertViewFilterOperandToCoreOperand } from '@/utils/filter/utils/convert-view-filter-operand-to-core-operand.util';

describe('convertViewFilterOperandToCoreOperand', () => {
  it('should preserve STARTS_WITH', () => {
    expect(
      convertViewFilterOperandToCoreOperand(ViewFilterOperand.STARTS_WITH),
    ).toBe(ViewFilterOperand.STARTS_WITH);
  });
});
