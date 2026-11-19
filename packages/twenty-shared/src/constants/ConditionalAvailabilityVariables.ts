import { type ConditionalAvailabilityVariableDeclaration } from '@/types/ConditionalAvailabilityVariableDeclaration';

export const CONDITIONAL_AVAILABILITY_VARIABLES = {
  pageLayoutWidget: {
    device: true,
    selectedRecords: true,
    featureFlags: true,
    permissionFlags: true,
    currentRole: true,
    currentWorkspaceMember: true,
  },
} as const satisfies ConditionalAvailabilityVariableDeclaration;
