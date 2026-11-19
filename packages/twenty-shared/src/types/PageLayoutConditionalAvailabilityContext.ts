import { type ConditionalAvailabilityDevice } from './ConditionalAvailabilityDevice';
import { type ConditionalAvailabilityGlobalContext } from './ConditionalAvailabilityGlobalContext';
import { type ObjectRecord } from './ObjectRecord';

export type PageLayoutConditionalAvailabilityContext =
  ConditionalAvailabilityGlobalContext & {
    device: ConditionalAvailabilityDevice;
    selectedRecords: ObjectRecord[];
  };
