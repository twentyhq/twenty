import { ViewFilterOperand } from 'twenty-shared/types';

import { normalizeConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/normalize-conditional-display.util';

describe('normalizeConditionalDisplay', () => {
  it('should turn a rule without record filters into no rule', () => {
    expect(
      normalizeConditionalDisplay({
        recordFilters: [],
        recordFilterGroups: [],
      }),
    ).toBeNull();
  });

  it('should keep a rule with record filters', () => {
    const conditionalDisplay = {
      recordFilters: [
        {
          id: '0',
          contextKey: 'device' as const,
          operand: ViewFilterOperand.IS,
          value: '["DESKTOP"]',
        },
      ],
    };

    expect(normalizeConditionalDisplay(conditionalDisplay)).toBe(
      conditionalDisplay,
    );
  });
});
