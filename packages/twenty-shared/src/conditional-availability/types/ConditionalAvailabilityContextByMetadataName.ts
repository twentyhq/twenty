import { type ConditionalAvailabilityCurrentUserContext } from '@/conditional-availability/types/ConditionalAvailabilityCurrentUserContext';
import { type ConditionalAvailabilityDevice } from '@/conditional-availability/types/ConditionalAvailabilityDevice';

export type ConditionalAvailabilityContextByMetadataName = {
  pageLayoutWidget: ConditionalAvailabilityCurrentUserContext & {
    device: ConditionalAvailabilityDevice;
    selectedRecords: Record<string, unknown>[];
  };
};
