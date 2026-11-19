import { parseConditionalAvailabilityExpression } from 'twenty-shared/utils';

import { fromPageLayoutWidgetJsonLogicToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-page-layout-widget-json-logic-to-conditional-availability.util';

const STAGE = { var: 'selectedRecords.0.stage' };
const TAGS = { var: 'selectedRecords.0.tags' };
const DEVICE_IS_MOBILE = { '===': [{ var: 'device' }, 'MOBILE'] };

const getTreeOfTextRule = (expression: string) => {
  const parseResult = parseConditionalAvailabilityExpression({
    expression,
    metadataName: 'pageLayoutWidget',
  });

  if (!parseResult.isValid) {
    throw new Error(parseResult.errorMessage);
  }

  return parseResult.node;
};

describe('fromPageLayoutWidgetJsonLogicToConditionalAvailability', () => {
  it.each([
    ['a device rule', { and: [DEVICE_IS_MOBILE] }, 'device == "MOBILE"'],
    [
      'a value held by a field of the record',
      { in: ['VIP', TAGS] },
      'includesSome(selectedRecords, "tags", "VIP")',
    ],
    [
      'a field of the record equal to a value',
      { '==': [STAGE, 'WON'] },
      'everyEquals(selectedRecords, "stage", "WON")',
    ],
    [
      'a field of the record different from a value',
      { '!==': [STAGE, 'WON'] },
      'noneEquals(selectedRecords, "stage", "WON")',
    ],
    [
      'a sub field of the record',
      { '==': [{ var: 'selectedRecords.0.address.city' }, 'Paris'] },
      'everyEquals(selectedRecords, "address.city", "Paris")',
    ],
    ['two values compared', { '==': [1, 1] }, '1 == 1'],
    [
      'none of several values',
      { '!': { or: [{ in: ['VIP', TAGS] }, { in: ['PARTNER', TAGS] }] } },
      'not (includesSome(selectedRecords, "tags", "VIP") or includesSome(selectedRecords, "tags", "PARTNER"))',
    ],
    [
      'nested groups of the same kind',
      {
        and: [
          { and: [DEVICE_IS_MOBILE, { '==': [STAGE, 'WON'] }] },
          { in: ['VIP', TAGS] },
        ],
      },
      'device == "MOBILE" and everyEquals(selectedRecords, "stage", "WON") and includesSome(selectedRecords, "tags", "VIP")',
    ],
  ])(
    'should convert %s to the tree of the same rule written as text',
    (_description, jsonLogic, expression) => {
      expect(
        fromPageLayoutWidgetJsonLogicToConditionalAvailability(jsonLogic),
      ).toEqual(getTreeOfTextRule(expression));
    },
  );

  it.each([
    ['an operator it does not know', { '>': [{ var: 'count' }, 1] }],
    ['a variable it does not know', { '===': [{ var: 'role' }, 'ADMIN'] }],
    ['a field compared with another field', { '==': [STAGE, STAGE] }],
    ['an empty object', {}],
    [
      'a group holding a condition it cannot convert',
      { and: [DEVICE_IS_MOBILE, { '>': [1, 2] }] },
    ],
  ])('should not convert %s', (_description, jsonLogic) => {
    expect(
      fromPageLayoutWidgetJsonLogicToConditionalAvailability(jsonLogic),
    ).toBeUndefined();
  });
});
