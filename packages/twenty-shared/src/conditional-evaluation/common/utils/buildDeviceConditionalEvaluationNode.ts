import { type ConditionalEvaluationDevice } from '@/conditional-evaluation/common/types/ConditionalEvaluationDevice';
import { type ConditionalEvaluationNode } from '@/conditional-evaluation/common/types/ConditionalEvaluationNode';

export const buildDeviceConditionalEvaluationNode = (
  device: ConditionalEvaluationDevice,
): ConditionalEvaluationNode => ({
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'VARIABLE', path: 'device' },
  right: { type: 'LITERAL', value: device },
});
