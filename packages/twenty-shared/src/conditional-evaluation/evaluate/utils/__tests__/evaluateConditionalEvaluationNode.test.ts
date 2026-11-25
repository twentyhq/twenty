import { evaluateConditionalAvailabilityExpression } from '@/conditional-availability/utils/evaluateConditionalAvailabilityExpression';
import { evaluateConditionalAvailabilityNode } from '@/conditional-availability/utils/evaluateConditionalAvailabilityNode';
import { parseConditionalAvailabilityExpression } from '@/conditional-availability/utils/parseConditionalAvailabilityExpression';

const EXPRESSIONS = [
  'true',
  'false',
  'device == "MOBILE"',
  'device != "MOBILE"',
  'device < "E"',
  'featureFlags.IS_ON',
  'not featureFlags.IS_ON',
  'featureFlags.IS_MISSING == true',
  'featureFlags.IS_MISSING != true',
  'featureFlags.IS_MISSING.deeper != true',
  'featureFlags.IS_ON and device == "DESKTOP"',
  'featureFlags.IS_OFF or device == "MOBILE"',
  'not (featureFlags.IS_ON or device == "MOBILE") and arrayLength(selectedRecords) == 0',
  'everyEquals(selectedRecords, "stage", "WON")',
  'someEquals(selectedRecords, "stage", "WON")',
  'noneEquals(selectedRecords, "stage", "WON")',
  'everyDefined(selectedRecords, "closedAt")',
  'includesSome(selectedRecords, "tags", "VIP")',
  'arrayLength(selectedRecords) >= 1',
  'arrayLength(selectedRecords) > -1',
  'arrayLength(selectedRecords) < "2"',
  'device == "DESKTOP" and everyEquals(selectedRecords, "stage", "WON")',
  'isDefined(device.trim)',
  'selectedRecords >= selectedRecords',
];

const WON_RECORD = {
  id: '1',
  stage: 'WON',
  closedAt: '2026-01-01',
  tags: ['VIP'],
};
const LOST_RECORD = { id: '2', stage: 'LOST', closedAt: null, tags: [] };

const DESKTOP_CONTEXT = {
  device: 'DESKTOP',
  selectedRecords: [WON_RECORD],
  featureFlags: { IS_ON: true, IS_OFF: false },
};

const CONTEXTS: Record<string, unknown>[] = [
  DESKTOP_CONTEXT,
  { ...DESKTOP_CONTEXT, device: 'MOBILE', featureFlags: { IS_ON: false } },
  { ...DESKTOP_CONTEXT, selectedRecords: [WON_RECORD, LOST_RECORD] },
  { ...DESKTOP_CONTEXT, selectedRecords: [] },
  { ...DESKTOP_CONTEXT, featureFlags: {} },
  { device: 'DESKTOP' },
  {},
];

const parseWidgetRuleOrThrow = (expression: string) => {
  const result = parseConditionalAvailabilityExpression({
    expression,
    metadataName: 'pageLayoutWidget',
  });

  if (!result.isValid) {
    throw new Error(`"${expression}" did not parse`);
  }

  return result.node;
};

describe('evaluateConditionalAvailabilityNode', () => {
  it('should show the item when there is no rule', () => {
    expect(
      evaluateConditionalAvailabilityNode({ node: null, context: {} }),
    ).toBe(true);
  });

  it('should hide the item when a variable is missing', () => {
    expect(
      evaluateConditionalAvailabilityNode({
        node: { type: 'VARIABLE', path: 'featureFlags.IS_ON' },
        context: {},
      }),
    ).toBe(false);
  });

  it('should show the item only when the result is exactly true', () => {
    expect(
      evaluateConditionalAvailabilityNode({
        node: { type: 'VARIABLE', path: 'device' },
        context: { device: 'DESKTOP' },
      }),
    ).toBe(false);
  });

  it('should not read a value through a prototype', () => {
    expect(
      evaluateConditionalAvailabilityNode({
        node: {
          type: 'COMPARISON',
          operator: 'NOT_EQUAL',
          left: { type: 'VARIABLE', path: 'device.constructor' },
          right: { type: 'LITERAL', value: 'x' },
        },
        context: { device: 'DESKTOP' },
      }),
    ).toBe(false);
  });

  it('should hide the item when a function is unknown', () => {
    expect(
      evaluateConditionalAvailabilityNode({
        node: {
          type: 'FUNCTION_CALL',
          functionName: 'toString',
          arguments: [],
        },
        context: {},
      }),
    ).toBe(false);
  });

  it.each(EXPRESSIONS)(
    'should give the same result as the text evaluator for %p in every context',
    (expression) => {
      const node = parseWidgetRuleOrThrow(expression);

      const treeResults = CONTEXTS.map((context) =>
        evaluateConditionalAvailabilityNode({ node, context }),
      );
      const textResults = CONTEXTS.map((context) =>
        evaluateConditionalAvailabilityExpression(expression, context),
      );

      expect(treeResults).toEqual(textResults);
    },
  );
});
