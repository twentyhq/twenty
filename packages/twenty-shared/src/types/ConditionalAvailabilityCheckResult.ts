import { type ConditionalAvailabilityCheckError } from './ConditionalAvailabilityCheckError';
import { type ConditionalAvailabilityNode } from './ConditionalAvailabilityNode';

export type ConditionalAvailabilityCheckResult =
  | { isValid: true; node: ConditionalAvailabilityNode | null }
  | ConditionalAvailabilityCheckError;
