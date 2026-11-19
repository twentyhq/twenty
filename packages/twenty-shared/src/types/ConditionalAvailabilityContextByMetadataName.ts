import { type ObjectRecord } from './ObjectRecord';

export type ConditionalAvailabilityContextByMetadataName = {
  pageLayoutWidget: {
    device: 'MOBILE' | 'DESKTOP';
    selectedRecords: ObjectRecord[];
    featureFlags: Record<string, boolean>;
  };
};
