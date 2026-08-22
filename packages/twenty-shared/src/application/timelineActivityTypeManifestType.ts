import { type TimelineActivityAction } from '@/timeline';

import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type TimelineActivityTypeManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  action?: TimelineActivityAction;
  icon?: string;
  objectUniversalIdentifier?: string;
  targetRelationFieldUniversalIdentifier?: string;
  triggerFieldUniversalIdentifiers?: string[];
  frontComponentUniversalIdentifier?: string;
  overridesTimelineActivityTypeUniversalIdentifier?: string;
};
