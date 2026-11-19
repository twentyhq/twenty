import { CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT } from '@/constants/ConditionalAvailabilityMaxNodeCount';
import { checkConditionalAvailabilityNode } from '@/utils/conditional-availability/checkConditionalAvailabilityNode';

const DEVICE_IS_MOBILE = {
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'PATH', path: 'device' },
  right: { type: 'LITERAL', value: 'MOBILE' },
};

describe('checkConditionalAvailabilityNode', () => {
  it.each([null, undefined])('should accept no rule (%p)', (node) => {
    expect(
      checkConditionalAvailabilityNode({
        node,
        metadataName: 'pageLayoutWidget',
      }),
    ).toEqual({ isValid: true, node: null });
  });

  it('should accept a valid tree and hand it back', () => {
    expect(
      checkConditionalAvailabilityNode({
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
      { type: 'PATH', path: 'selectedRecords[0]' },
      'path',
    ],
    ['a value that is a list', { type: 'LITERAL', value: ['MOBILE'] }, 'value'],
  ])('should refuse %s', (_description, node, path) => {
    expect(
      checkConditionalAvailabilityNode({
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
      { type: 'PATH', path: 'pageType' },
      'pageType',
    ],
    [
      'a function that is not declared',
      { type: 'CALL', functionName: 'fooBar', arguments: [] },
      'fooBar',
    ],
    [
      'a path through a prototype',
      { type: 'PATH', path: 'device.__proto__' },
      '__proto__',
    ],
  ])('should refuse %s', (_description, node, name) => {
    expect(
      checkConditionalAvailabilityNode({
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
      checkConditionalAvailabilityNode({
        node: {
          type: 'GROUP',
          logicalOperator: 'OR',
          children: Array.from(
            { length: CONDITIONAL_AVAILABILITY_MAX_NODE_COUNT },
            () => ({ type: 'PATH', path: 'device' }),
          ),
        },
        metadataName: 'pageLayoutWidget',
      }),
    ).toMatchObject({ isValid: false, errorCode: 'RULE_TOO_LARGE' });
  });
});
