import { type TimelineActivityAction } from '@/timeline';

import { type SyncableEntityOptions } from './syncableEntityOptionsType';

export type TimelineActivityTypeEmitThroughManifest = {
  relationFieldUniversalIdentifier: string;
  triggerFieldUniversalIdentifiers?: string[];
};

export type TimelineActivityTypeEmitManifest = {
  on: TimelineActivityAction;
  objectUniversalIdentifier: string;
  through?: TimelineActivityTypeEmitThroughManifest;
};

export type TimelineActivityTypeManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  icon?: string;
  emit?: TimelineActivityTypeEmitManifest;
  frontComponentUniversalIdentifier?: string;
  replacesTimelineActivityTypeUniversalIdentifier?: string;
};
