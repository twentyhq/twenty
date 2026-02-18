import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type CommandMenuItemManifest = SyncableEntityOptions & {
  label: string;
  icon?: string;
  isPinned?: boolean;
  availabilityType?: 'GLOBAL' | 'SINGLE_RECORD' | 'BULK_RECORDS';
  availabilityObjectUniversalIdentifier?: string;
  frontComponentUniversalIdentifier: string;
};
