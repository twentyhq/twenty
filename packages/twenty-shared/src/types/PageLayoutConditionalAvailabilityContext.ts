import { type ObjectRecord } from './ObjectRecord';

export type PageLayoutConditionalAvailabilityContext = {
  device: 'MOBILE' | 'DESKTOP';
  selectedRecords: ObjectRecord[];
  featureFlags: Record<string, boolean>;
};
