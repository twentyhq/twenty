import { type ConditionalAvailabilityDevice } from '@/conditional-availability/types/ConditionalAvailabilityDevice';
import { type ConditionalAvailabilityGlobalContext } from '@/conditional-availability/types/ConditionalAvailabilityGlobalContext';

export type ConditionalAvailabilityContextByMetadataName = {
  pageLayoutWidget: ConditionalAvailabilityGlobalContext & {
    device: ConditionalAvailabilityDevice;
    selectedRecords: Record<string, unknown>[];
  };
};
