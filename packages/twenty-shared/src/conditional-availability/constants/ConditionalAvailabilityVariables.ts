import { type ConditionalAvailabilityContextByMetadataName } from '@/conditional-availability/types/ConditionalAvailabilityContextByMetadataName';

export const CONDITIONAL_AVAILABILITY_VARIABLES = {
  pageLayoutWidget: {
    device: true,
    selectedRecords: true,
    featureFlags: true,
    permissionFlags: true,
    currentRole: true,
    currentWorkspaceMember: true,
  },
} as const satisfies {
  [TMetadataName in keyof ConditionalAvailabilityContextByMetadataName]: Record<
    keyof ConditionalAvailabilityContextByMetadataName[TMetadataName],
    true
  >;
};
