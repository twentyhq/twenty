import { parseConditionalAvailabilityExpression } from '@/utils/conditional-availability/parseConditionalAvailabilityExpression';
import { printConditionalAvailabilityNode } from '@/utils/conditional-availability/printConditionalAvailabilityNode';

const CANONICAL_EXPRESSIONS = [
  'featureFlags.A',
  'false',
  'not featureFlags.A',
  'arrayLength(selectedRecords) >= 1',
  'arrayLength(selectedRecords) > -1',
  'device == "MOBILE"',
  'device != "DESKTOP"',
  'isDefined(device)',
  'everyEquals(selectedRecords, "stage", "WON")',
  'noneDefined(selectedRecords, "deletedAt") and arrayLength(selectedRecords) == 1',
  'featureFlags.A or everyEquals(selectedRecords, "stage", "WON")',
  'featureFlags.A and (device == "MOBILE" or device == "DESKTOP")',
  '(featureFlags.A and device == "MOBILE") or arrayLength(selectedRecords) == 1',
  'not (device == "MOBILE")',
  'not (featureFlags.A or featureFlags.B) and arrayLength(selectedRecords) == 1',
  'device == "a \\"quoted\\" text"',
];

const parseWidgetRuleOrThrow = (expression: string) => {
  const result = parseConditionalAvailabilityExpression({
    expression,
    metadataName: 'pageLayoutWidget',
  });

  if (!result.isValid || result.node === null) {
    throw new Error(`"${expression}" did not parse`);
  }

  return result.node;
};

describe('printConditionalAvailabilityNode', () => {
  it.each(CANONICAL_EXPRESSIONS)(
    'should print %p exactly as it was written',
    (expression) => {
      expect(
        printConditionalAvailabilityNode({
          node: parseWidgetRuleOrThrow(expression),
        }),
      ).toBe(expression);
    },
  );

  it.each([
    [
      'featureFlags.A   and   featureFlags.B',
      'featureFlags.A and featureFlags.B',
    ],
    ["device == 'MOBILE'", 'device == "MOBILE"'],
    [
      '(featureFlags.A and featureFlags.B) and device == "MOBILE"',
      'featureFlags.A and featureFlags.B and device == "MOBILE"',
    ],
    [
      'featureFlags.A or featureFlags.B and device == "MOBILE"',
      'featureFlags.A or (featureFlags.B and device == "MOBILE")',
    ],
  ])('should print %p in the canonical form %p', (expression, canonical) => {
    expect(
      printConditionalAvailabilityNode({
        node: parseWidgetRuleOrThrow(expression),
      }),
    ).toBe(canonical);
  });

  it.each([
    'ends with a backslash \\',
    'ends with two backslashes \\\\',
    'a \\ in the middle',
    'ends with a quote "',
    'ends with a backslash and a quote \\"',
    'a line\nbreak and a\ttab',
    '\\',
    '',
  ])(
    'should print the text value %p so that it reads back the same',
    (text) => {
      const node = {
        type: 'COMPARISON' as const,
        operator: 'EQUAL' as const,
        left: { type: 'PATH' as const, path: 'device' },
        right: { type: 'LITERAL' as const, value: text },
      };

      expect(
        parseWidgetRuleOrThrow(printConditionalAvailabilityNode({ node })),
      ).toEqual(node);
    },
  );
});
