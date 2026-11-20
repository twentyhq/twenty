import { type ConditionalAvailabilityNode } from '@/conditional-availability/types/ConditionalAvailabilityNode';

export const buildDeviceConditionalAvailability = (
  device: 'MOBILE' | 'DESKTOP',
): ConditionalAvailabilityNode => ({
  type: 'COMPARISON',
  operator: 'EQUAL',
  left: { type: 'VARIABLE', path: 'device' },
  right: { type: 'LITERAL', value: device },
});
