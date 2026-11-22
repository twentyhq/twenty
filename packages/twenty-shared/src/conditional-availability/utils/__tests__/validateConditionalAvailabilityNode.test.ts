import { CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT } from '@/conditional-availability/constants/ConditionalAvailabilityMaxNodeCount';
import { validateConditionalAvailabilityNode } from '@/conditional-availability/utils/validateConditionalAvailabilityNode';

const DEVICE_IS_MOBILE = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'VARIABLE', path: 'device' },
  right: { type: 'LITERAL', value: 'MOBILE' },
};

describe('validateConditionalAvailabilityNode', () => {
  it.each([null, undefined])('should accept no rule (%p)', (node) => {
    expect(
      validateConditionalAvailabilityNode({
        node,
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ isValid: true, node: null });
  });

  it('should accept a valid tree and hand it back', () => {
    expect(
      validateConditionalAvailabilityNode({
        node: DEVICE_IS_MOBILE,
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ isValid: true, node: DEVICE_IS_MOBILE });
  });

  it.each([
    ['a text instead of a tree', 'device == "MOBILE"', ''],
    ['an unknown kind of node', { type: 'ASSIGNMENT' }, 'type'],
    [
      'an unknown comparison operator',
      { ...DEVICE_IS_MOBILE, operator: 'LIKE' },
      'operator',
    ],
    [
      'a property that does not belong',
      { ...DEVICE_IS_MOBILE, extra: true },
      '',
    ],
    [
      'a group with no child',
      { type: 'GROUP', logicalOperator: 'AND', children: [] },
      'children',
    ],
    [
      'a broken node deep in a group',
      {
        type: 'GROUP',
        logicalOperator: 'OR',
        children: [DEVICE_IS_MOBILE, { type: 'NOT' }],
      },
      'children.1.child',
    ],
    [
      'a path with a bracket',
      { type: 'VARIABLE', path: 'selectedRecords[0]' },
      'path',
    ],
    [
      'a path through a prototype',
      { type: 'VARIABLE', path: 'device.__proto__' },
      'path',
    ],
    [
      'a function name with a dot',
      {
        type: 'FUNCTION_CALL',
        functionName: 'device.isDefined',
        arguments: [],
      },
      'functionName',
    ],
    ['a value that is a list', { type: 'LITERAL', value: ['MOBILE'] }, 'value'],
  ])('should refuse %s', (_description, node, path) => {
    expect(
      validateConditionalAvailabilityNode({
        node,
        metadataName: 'pageLayoutWidget',
      }),
    ).toMatchObject({
      isValid: false,
      errorCode: 'INVALID_NODE',
      errorParams: { path },
    });
  });

  it.each([
    [
      'a variable a widget cannot read',
      { type: 'VARIABLE', path: 'pageType' },
      'pageType',
    ],
    [
      'a function that is not declared',
      { type: 'FUNCTION_CALL', functionName: 'fooBar', arguments: [] },
      'fooBar',
    ],
  ])('should refuse %s', (_description, node, name) => {
    expect(
      validateConditionalAvailabilityNode({
        node,
        metadataName: 'pageLayoutWidget',
      }),
    ).toMatchObject({
      isValid: false,
      errorCode: 'UNKNOWN_NAME',
      errorParams: { name },
    });
  });

  it('should refuse a tree with too many nodes', () => {
    expect(
      validateConditionalAvailabilityNode({
        node: {
          type: 'GROUP',
          logicalOperator: 'OR',
          children: Array.from(
            { length: CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT },
            () => ({ type: 'VARIABLE', path: 'device' }),
          ),
        },
        metadataName: 'pageLayoutWidget',
      }),
    ).toMatchObject({ isValid: false, errorCode: 'RULE_TOO_LARGE' });
  });
});
