import { type ConditionalAvailabilityDevice } from './ConditionalAvailabilityDevice';
import { type ConditionalAvailabilityGlobalContext } from './ConditionalAvailabilityGlobalContext';
import { type ObjectRecord } from './ObjectRecord';

export type ConditionalAvailabilityContextByMetadataName = {
  pageLayoutWidget: ConditionalAvailabilityGlobalContext & {
    device: ConditionalAvailabilityDevice;
    selectedRecords: ObjectRecord[];
  };
};
