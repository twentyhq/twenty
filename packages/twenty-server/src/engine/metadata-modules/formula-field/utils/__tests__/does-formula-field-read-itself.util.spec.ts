import { doesFormulaFieldReadItself } from 'src/engine/metadata-modules/formula-field/utils/does-formula-field-read-itself.util';

const FORMULA_BY_UNIVERSAL_IDENTIFIER: Record<string, unknown> = {
  'person-team-size-uid': {
    expression: 'count(reports) + sum(reports.teamSize)',
    bindings: {
      reports: 'person-reports-uid',
      'reports.teamSize': 'person-team-size-uid',
    },
  },
  'company-head-count-uid': {
    expression: 'sum(people.teamSize)',
    bindings: {
      people: 'company-people-uid',
      'people.teamSize': 'person-team-size-uid',
    },
  },
};

const readsItself = (universalIdentifier: string) =>
  doesFormulaFieldReadItself({
    universalIdentifier,
    formula: FORMULA_BY_UNIVERSAL_IDENTIFIER[universalIdentifier],
    findFormula: (fieldUniversalIdentifier) =>
      FORMULA_BY_UNIVERSAL_IDENTIFIER[fieldUniversalIdentifier],
  });

describe('doesFormulaFieldReadItself', () => {
  it('should find a formula reading its own value through a relation', () => {
    expect(readsItself('person-team-size-uid')).toBe(true);
  });

  it('should accept a formula reading another formula', () => {
    expect(readsItself('company-head-count-uid')).toBe(false);
  });
});
