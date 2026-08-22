import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type TimelineActivityAction } from '@/timeline/TimelineActivityAction';
import { type TimelineActivityRenderer } from '@/timeline/TimelineActivityRenderer';

export type TimelineActivityTypeManifest = SyncableEntityOptions & {
  name: string;
  label: string;
  // The verb the entry describes. Omit for a type that is only offered for
  // creation and never stamped on a row
  action?: TimelineActivityAction;
  icon?: string;
  // The component drawing the row. Omit to render from label and icon alone
  renderer?: TimelineActivityRenderer;
  // The object whose records this entry is about, so events on it are stamped
  // with this type instead of the shared one for the same action
  objectUniversalIdentifier?: string;
};
