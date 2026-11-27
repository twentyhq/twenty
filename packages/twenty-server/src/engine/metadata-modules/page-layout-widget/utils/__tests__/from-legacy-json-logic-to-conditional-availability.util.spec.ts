import {
  evaluateConditionalEvaluationNode,
  printConditionalEvaluationNode,
} from 'twenty-shared/conditional-evaluation';
import { isDefined } from 'twenty-shared/utils';

import { fromLegacyJsonLogicToConditionalAvailability } from 'src/engine/metadata-modules/page-layout-widget/utils/from-legacy-json-logic-to-conditional-availability.util';

const recordField = (name: string) => ({ var: `selectedRecords.0.${name}` });

const printConvertedRule = (jsonLogic: unknown): string | undefined => {
  const node = fromLegacyJsonLogicToConditionalAvailability(jsonLogic);

  return isDefined(node) ? printConditionalEvaluationNode({ node }) : undefined;
};

describe('fromLegacyJsonLogicToConditionalAvailability', () => {
  it.each([
    {
      title: 'the device rule of built-in widgets',
      jsonLogic: { and: [{ '===': [{ var: 'device' }, 'MOBILE'] }] },
      expected: 'device == "MOBILE"',
    },
    {
      title: 'a record field equal to a value',
      jsonLogic: { '==': [recordField('stage'), 'WON'] },
      expected: 'everyEquals(selectedRecords, "stage", "WON")',
    },
    {
      title: 'a value equal to a record field',
      jsonLogic: { '===': [true, recordField('isPaid')] },
      expected: 'everyEquals(selectedRecords, "isPaid", true)',
    },
    {
      title: 'a nested record field',
      jsonLogic: { '===': [recordField('owner.name'), 'Ada'] },
      expected: 'everyEquals(selectedRecords, "owner.name", "Ada")',
    },
    {
      title: 'a record field different from a value',
      jsonLogic: { '!=': [recordField('stage'), 'WON'] },
      expected: 'not everyEquals(selectedRecords, "stage", "WON")',
    },
    {
      title: 'a value held by a multi-value record field',
      jsonLogic: { in: ['VIP', recordField('tags')] },
      expected: 'includesSome(selectedRecords, "tags", "VIP")',
    },
    {
      title: 'a record field that is one of several values',
      jsonLogic: { in: [recordField('stage'), ['WON', 'LOST']] },
      expected:
        'everyEquals(selectedRecords, "stage", "WON") or everyEquals(selectedRecords, "stage", "LOST")',
    },
    {
      title: 'a record field that is filled',
      jsonLogic: { '!!': [recordField('closedAt')] },
      expected: 'every(selectedRecords, "closedAt")',
    },
    {
      title: 'a record field that is empty',
      jsonLogic: { '!': recordField('closedAt') },
      expected: 'not every(selectedRecords, "closedAt")',
    },
    {
      title: 'a feature flag',
      jsonLogic: { '===': [{ var: 'featureFlags.IS_EXAMPLE_ENABLED' }, true] },
      expected: 'featureFlags.IS_EXAMPLE_ENABLED == true',
    },
    {
      title: 'a feature flag read as a truth value',
      jsonLogic: { '!!': { var: 'featureFlags.IS_EXAMPLE_ENABLED' } },
      expected: 'featureFlags.IS_EXAMPLE_ENABLED == true',
    },
    {
      title: 'two values of the same type',
      jsonLogic: { '==': [1, 0] },
      expected: '1 == 0',
    },
    {
      title: 'groups nested in groups',
      jsonLogic: {
        or: [
          {
            and: [
              { '==': [recordField('stage'), 'WON'] },
              { '!!': [recordField('closedAt')] },
            ],
          },
          {
            '!': {
              or: [
                { in: ['VIP', recordField('tags')] },
                { in: [recordField('stage'), ['LOST', 'NEW']] },
              ],
            },
          },
        ],
      },
      expected:
        '(everyEquals(selectedRecords, "stage", "WON") and every(selectedRecords, "closedAt")) or not (includesSome(selectedRecords, "tags", "VIP") or everyEquals(selectedRecords, "stage", "LOST") or everyEquals(selectedRecords, "stage", "NEW"))',
    },
  ])('should read $title', ({ jsonLogic, expected }) => {
    expect(printConvertedRule(jsonLogic)).toBe(expected);
  });

  it.each([
    { title: 'a record field on its own', jsonLogic: recordField('stage') },
    {
      title: 'a record field on its own inside a group',
      jsonLogic: {
        and: [{ '==': [recordField('stage'), 'WON'] }, recordField('closedAt')],
      },
    },
    {
      title: 'an operator the tree has no equivalent for',
      jsonLogic: { '<': [recordField('amount'), 5] },
    },
    {
      title: 'a loose comparison with a number',
      jsonLogic: { '==': [recordField('amount'), 5] },
    },
    {
      title: 'a loose comparison with text that reads as a number',
      jsonLogic: { '==': [recordField('amount'), '5'] },
    },
    {
      title: 'a loose comparison with empty text',
      jsonLogic: { '!=': [recordField('name'), ''] },
    },
    {
      title: 'a loose comparison of two values of different types',
      jsonLogic: { '==': [1, '1'] },
    },
    { title: 'an empty group', jsonLogic: { and: [] } },
    {
      title: 'a record field checked against no value',
      jsonLogic: { in: [recordField('stage'), []] },
    },
    {
      title: 'a variable the tree does not know',
      jsonLogic: { '===': [{ var: 'currentUser.id' }, 'example'] },
    },
    {
      title: 'two operators side by side',
      jsonLogic: { '===': [1, 1], '!==': [1, 2] },
    },
  ])('should not read $title', ({ jsonLogic }) => {
    expect(fromLegacyJsonLogicToConditionalAvailability(jsonLogic)).toBe(
      undefined,
    );
  });

  it('should keep a "different from" rule true while no record is loaded, as json-logic did', () => {
    const node = fromLegacyJsonLogicToConditionalAvailability({
      '!=': [recordField('stage'), 'WON'],
    });

    expect(
      evaluateConditionalEvaluationNode({
        node,
        context: { device: 'DESKTOP', selectedRecords: [], featureFlags: {} },
      }),
    ).toBe(true);
  });

  it('should keep an "equal to" rule false while no record is loaded, as json-logic did', () => {
    const node = fromLegacyJsonLogicToConditionalAvailability({
      '==': [recordField('stage'), 'WON'],
    });

    expect(
      evaluateConditionalEvaluationNode({
        node,
        context: { device: 'DESKTOP', selectedRecords: [], featureFlags: {} },
      }),
    ).toBe(false);
  });
});
