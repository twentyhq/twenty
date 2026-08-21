import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type TimelineActivityAction } from '@/timeline/TimelineActivityAction';

export type TimelineActivityTypeManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  // Selects a built-in timeline row renderer. Omit to render from label and icon
  action?: TimelineActivityAction;
  icon?: string;
};
