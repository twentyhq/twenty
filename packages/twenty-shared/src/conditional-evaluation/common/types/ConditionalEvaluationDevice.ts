import { type CONDITIONAL_AVAILABILITY_DEVICES } from '@/conditional-availability/constants/ConditionalAvailabilityDevices';

export type ConditionalAvailabilityDevice =
  (typeof CONDITIONAL_AVAILABILITY_DEVICES)[number];
