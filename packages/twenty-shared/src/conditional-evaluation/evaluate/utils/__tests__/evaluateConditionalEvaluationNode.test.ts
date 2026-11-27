import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { evaluateConditionalEvaluationExpression } from '@/conditional-evaluation/evaluate/utils/evaluateConditionalEvaluationExpression';
import { evaluateConditionalEvaluationNode } from '@/conditional-evaluation/evaluate/utils/evaluateConditionalEvaluationNode';
import { parseConditionalEvaluationExpression } from '@/conditional-evaluation/expression-to-nodes/utils/parseConditionalEvaluationExpression';
import { FieldMetadataType } from '@/types/FieldMetadataType';
import { type ValidationRuleFieldDescriptor } from '@/types/ValidationRuleFieldDescriptor';

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
  const result = parseConditionalEvaluationExpression({
    expression,
    metadataName: 'pageLayoutWidget',
  });

  if (!result.isValid) {
    throw new Error(`"${expression}" did not parse`);
  }

  return result.node;
};

describe('evaluateConditionalEvaluationNode', () => {
  it('should show the item when there is no rule', () => {
    expect(evaluateConditionalEvaluationNode({ node: null, context: {} })).toBe(
      true,
    );
  });

  it('should hide the item when a variable is missing', () => {
    expect(
      evaluateConditionalEvaluationNode({
        node: { type: 'VARIABLE', path: 'featureFlags.IS_ON' },
        context: {},
      }),
    ).toBe(false);
  });

  it('should show the item only when the result is exactly true', () => {
    expect(
      evaluateConditionalEvaluationNode({
        node: { type: 'VARIABLE', path: 'device' },
        context: { device: 'DESKTOP' },
      }),
    ).toBe(false);
  });

  it('should not read a value through a prototype', () => {
    expect(
      evaluateConditionalEvaluationNode({
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
      evaluateConditionalEvaluationNode({
        node: {
          type: 'FUNCTION_CALL',
          functionName: 'toString',
          arguments: [],
        },
        context: {},
      }),
    ).toBe(false);
  });

  describe('record fields', () => {
    const FIELDS: ValidationRuleFieldDescriptor[] = [
      {
        name: 'stage',
        type: FieldMetadataType.SELECT,
        universalIdentifier: 'stage-universal-identifier',
      },
      {
        name: 'amount',
        type: FieldMetadataType.CURRENCY,
        universalIdentifier: 'amount-universal-identifier',
      },
      {
        name: 'accountOwner',
        type: FieldMetadataType.RELATION,
        universalIdentifier: 'account-owner-universal-identifier',
        relationTargetFields: [
          {
            name: 'id',
            type: FieldMetadataType.UUID,
            universalIdentifier: 'workspace-member-id-universal-identifier',
          },
        ],
      },
    ];

    const RECORD = {
      stage: 'WON',
      amount: { amountMicros: 5_000_000, currencyCode: 'USD' },
      accountOwner: { id: 'workspace-member-1' },
    };

    const STAGE_IS_WON: ConditionalEvaluationNode = {
      type: 'COMPARISON',
      operator: 'EQUAL',
      left: {
        type: 'FIELD',
        fieldUniversalIdentifier: 'stage-universal-identifier',
      },
      right: { type: 'LITERAL', value: 'WON' },
    };

    it('should compare a field of the record', () => {
      expect(
        evaluateConditionalEvaluationNode({
          node: STAGE_IS_WON,
          context: {},
          record: RECORD,
          fields: FIELDS,
        }),
      ).toBe(true);
      expect(
        evaluateConditionalEvaluationNode({
          node: STAGE_IS_WON,
          context: {},
          record: { ...RECORD, stage: 'LOST' },
          fields: FIELDS,
        }),
      ).toBe(false);
    });

    it('should compare a sub field of the record', () => {
      expect(
        evaluateConditionalEvaluationNode({
          node: {
            type: 'COMPARISON',
            operator: 'GREATER_THAN_OR_EQUAL',
            left: {
              type: 'FIELD',
              fieldUniversalIdentifier: 'amount-universal-identifier',
              subFieldName: 'amountMicros',
            },
            right: { type: 'LITERAL', value: 1_000_000 },
          },
          context: {},
          record: RECORD,
          fields: FIELDS,
        }),
      ).toBe(true);
    });

    it('should compare a field read through a relation with a variable', () => {
      const node: ConditionalEvaluationNode = {
        type: 'COMPARISON',
        operator: 'EQUAL',
        left: {
          type: 'FIELD',
          relationFieldUniversalIdentifier:
            'account-owner-universal-identifier',
          fieldUniversalIdentifier: 'workspace-member-id-universal-identifier',
        },
        right: { type: 'VARIABLE', path: 'currentWorkspaceMember.id' },
      };

      expect(
        evaluateConditionalEvaluationNode({
          node,
          context: { currentWorkspaceMember: { id: 'workspace-member-1' } },
          record: RECORD,
          fields: FIELDS,
        }),
      ).toBe(true);
      expect(
        evaluateConditionalEvaluationNode({
          node,
          context: { currentWorkspaceMember: { id: 'workspace-member-2' } },
          record: RECORD,
          fields: FIELDS,
        }),
      ).toBe(false);
    });

    it('should hide the item when there is no record', () => {
      expect(
        evaluateConditionalEvaluationNode({
          node: STAGE_IS_WON,
          context: {},
          fields: FIELDS,
        }),
      ).toBe(false);
    });

    it('should hide the item when the field no longer exists', () => {
      expect(
        evaluateConditionalEvaluationNode({
          node: {
            type: 'NOT',
            child: STAGE_IS_WON,
          },
          context: {},
          record: RECORD,
          fields: [],
        }),
      ).toBe(false);
    });

    it('should not read a sub field through a prototype', () => {
      expect(
        evaluateConditionalEvaluationNode({
          node: {
            type: 'COMPARISON',
            operator: 'NOT_EQUAL',
            left: {
              type: 'FIELD',
              fieldUniversalIdentifier: 'stage-universal-identifier',
              subFieldName: 'constructor',
            },
            right: { type: 'LITERAL', value: 'x' },
          },
          context: {},
          record: RECORD,
          fields: FIELDS,
        }),
      ).toBe(false);
    });
  });

  it.each(EXPRESSIONS)(
    'should give the same result as the text evaluator for %p in every context',
    (expression) => {
      const node = parseWidgetRuleOrThrow(expression);

      const treeResults = CONTEXTS.map((context) =>
        evaluateConditionalEvaluationNode({ node, context }),
      );
      const textResults = CONTEXTS.map((context) =>
        evaluateConditionalEvaluationExpression(expression, context),
      );

      expect(treeResults).toEqual(textResults);
    },
  );
});
