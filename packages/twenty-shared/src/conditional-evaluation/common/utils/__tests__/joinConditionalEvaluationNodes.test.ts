import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';
import { buildDeviceConditionalEvaluationNode } from '@/conditional-evaluation/common/utils/buildDeviceConditionalEvaluationNode';
import { joinConditionalEvaluationNodes } from '@/conditional-evaluation/common/utils/joinConditionalEvaluationNodes';

const DEVICE_IS_MOBILE = buildDeviceConditionalEvaluationNode('MOBILE');
const DEVICE_IS_DESKTOP = buildDeviceConditionalEvaluationNode('DESKTOP');

describe('joinConditionalEvaluationNodes', () => {
  it('should return the node itself when there is only one', () => {
    expect(
      joinConditionalEvaluationNodes({
        nodes: [DEVICE_IS_MOBILE],
        logicalOperator: 'AND',
      }),
    ).toEqual(DEVICE_IS_MOBILE);
  });

  it('should group several nodes under the logical operator', () => {
    expect(
      joinConditionalEvaluationNodes({
        nodes: [DEVICE_IS_MOBILE, DEVICE_IS_DESKTOP],
        logicalOperator: 'OR',
      }),
    ).toEqual({
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [DEVICE_IS_MOBILE, DEVICE_IS_DESKTOP],
    });
  });

  it('should lift the children of a group that uses the same logical operator', () => {
    const groupOfSameOperator: ConditionalEvaluationNode = {
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [DEVICE_IS_MOBILE, DEVICE_IS_DESKTOP],
    };

    expect(
      joinConditionalEvaluationNodes({
        nodes: [groupOfSameOperator, DEVICE_IS_MOBILE],
        logicalOperator: 'AND',
      }),
    ).toEqual({
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [DEVICE_IS_MOBILE, DEVICE_IS_DESKTOP, DEVICE_IS_MOBILE],
    });
  });

  it('should keep a group that uses the other logical operator', () => {
    const groupOfOtherOperator: ConditionalEvaluationNode = {
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [DEVICE_IS_MOBILE, DEVICE_IS_DESKTOP],
    };

    expect(
      joinConditionalEvaluationNodes({
        nodes: [groupOfOtherOperator, DEVICE_IS_MOBILE],
        logicalOperator: 'AND',
      }),
    ).toEqual({
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [groupOfOtherOperator, DEVICE_IS_MOBILE],
    });
  });
});
