import { type ConditionalAvailabilityVariableDeclaration } from '@/types/ConditionalAvailabilityVariableDeclaration';

export const CONDITIONAL_AVAILABILITY_VARIABLES = {
  pageLayoutWidget: {
    device: true,
    selectedRecords: true,
    featureFlags: true,
  },
} as const satisfies ConditionalAvailabilityVariableDeclaration;
