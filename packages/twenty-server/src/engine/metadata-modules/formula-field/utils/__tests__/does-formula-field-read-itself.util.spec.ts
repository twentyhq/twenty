import { type FieldMetadataFormula } from 'twenty-shared/types';

import { doesFormulaFieldReadItself } from 'src/engine/metadata-modules/formula-field/utils/does-formula-field-read-itself.util';

const FORMULA_BY_UNIVERSAL_IDENTIFIER: Record<string, FieldMetadataFormula> = {
  'person-team-size-uid': {
    tree: {
      type: 'FUNCTION_CALL',
      functionName: 'sum',
      arguments: [
        {
          type: 'FIELD',
          relationFieldUniversalIdentifier: 'person-reports-uid',
          fieldUniversalIdentifier: 'person-team-size-uid',
        },
      ],
    },
  },
  'company-head-count-uid': {
    tree: {
      type: 'FUNCTION_CALL',
      functionName: 'sum',
      arguments: [
        {
          type: 'FIELD',
          relationFieldUniversalIdentifier: 'company-people-uid',
          fieldUniversalIdentifier: 'person-team-size-uid',
        },
      ],
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
