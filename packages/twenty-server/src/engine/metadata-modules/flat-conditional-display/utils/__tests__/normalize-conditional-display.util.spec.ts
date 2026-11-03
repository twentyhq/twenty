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
});
