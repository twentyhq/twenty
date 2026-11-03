import { type ConditionalDisplay } from '@/types/conditional-display/ConditionalDisplay';
import { type ConditionalDisplayDevice } from '@/types/conditional-display/ConditionalDisplayDevice';
import { ViewFilterOperand } from '@/types/ViewFilterOperand';
import { buildConditionalDisplayFromConditionNode } from '@/utils/conditional-display/buildConditionalDisplayFromConditionNode';
import { buildDeviceConditionalDisplayConditionNode } from '@/utils/conditional-display/buildDeviceConditionalDisplayConditionNode';

export const buildDeviceConditionalDisplay = (
  device: ConditionalDisplayDevice,
): ConditionalDisplay =>
  buildConditionalDisplayFromConditionNode({
    conditionNode: buildDeviceConditionalDisplayConditionNode({
      device,
      operand: ViewFilterOperand.IS,
    }),
    source: `device:${device}`,
  });
