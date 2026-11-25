import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';
import { buildDeviceConditionalAvailability } from '@/conditional-availability/utils/buildDeviceConditionalAvailability';
import { joinConditionalAvailabilityNodes } from '@/conditional-availability/utils/joinConditionalAvailabilityNodes';

const DEVICE_IS_MOBILE = buildDeviceConditionalAvailability('MOBILE');
const DEVICE_IS_DESKTOP = buildDeviceConditionalAvailability('DESKTOP');

describe('joinConditionalAvailabilityNodes', () => {
  it('should return the node itself when there is only one', () => {
    expect(
      joinConditionalAvailabilityNodes({
        nodes: [DEVICE_IS_MOBILE],
        logicalOperator: 'AND',
      }),
    ).toEqual(DEVICE_IS_MOBILE);
  });

  it('should group several nodes under the logical operator', () => {
    expect(
      joinConditionalAvailabilityNodes({
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
    const groupOfSameOperator: ConditionalAvailabilityNode = {
      type: 'GROUP',
      logicalOperator: 'AND',
      children: [DEVICE_IS_MOBILE, DEVICE_IS_DESKTOP],
    };

    expect(
      joinConditionalAvailabilityNodes({
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
    const groupOfOtherOperator: ConditionalAvailabilityNode = {
      type: 'GROUP',
      logicalOperator: 'OR',
      children: [DEVICE_IS_MOBILE, DEVICE_IS_DESKTOP],
    };

    expect(
      joinConditionalAvailabilityNodes({
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
