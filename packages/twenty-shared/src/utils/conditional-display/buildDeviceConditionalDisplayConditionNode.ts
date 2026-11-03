import { type ConditionalDisplayDevice } from '@/types/conditional-display/ConditionalDisplayDevice';
import { type ConditionalDisplayRecordFilterConditionNode } from '@/types/conditional-display/internal/ConditionalDisplayRecordFilterConditionNode';
import { type ViewFilterOperand } from '@/types/ViewFilterOperand';

export const buildDeviceConditionalDisplayConditionNode = ({
  device,
  operand,
}: {
  device: ConditionalDisplayDevice;
  operand: ViewFilterOperand;
}): ConditionalDisplayRecordFilterConditionNode => ({
  kind: 'recordFilter',
  recordFilter: {
    contextKey: 'device',
    operand,
    value: JSON.stringify([device]),
  },
});
