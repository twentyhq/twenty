import { doesFormulaFieldReadItself } from 'src/engine/metadata-modules/formula-field/utils/does-formula-field-read-itself.util';

const SETTINGS_BY_UNIVERSAL_IDENTIFIER: Record<string, unknown> = {
  'person-team-size-uid': {
    formula: {
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
  },
  'company-head-count-uid': {
    formula: {
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
  },
};

const readsItself = (universalIdentifier: string) =>
  doesFormulaFieldReadItself({
    universalIdentifier,
    universalSettings: SETTINGS_BY_UNIVERSAL_IDENTIFIER[universalIdentifier],
    findUniversalSettings: (fieldUniversalIdentifier) =>
      SETTINGS_BY_UNIVERSAL_IDENTIFIER[fieldUniversalIdentifier],
  });

describe('doesFormulaFieldReadItself', () => {
  it('should find a formula reading its own value through a relation', () => {
    expect(readsItself('person-team-size-uid')).toBe(true);
  });

  it('should accept a formula reading another formula', () => {
    expect(readsItself('company-head-count-uid')).toBe(false);
  });
});
