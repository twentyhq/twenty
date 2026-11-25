import { type ConditionalAvailabilityDevice } from '@/conditional-availability/types/ConditionalAvailabilityDevice';
import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';

export const buildDeviceConditionalAvailability = (
  device: ConditionalAvailabilityDevice,
): ConditionalAvailabilityNode => ({
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'VARIABLE', path: 'device' },
  right: { type: 'LITERAL', value: device },
});
