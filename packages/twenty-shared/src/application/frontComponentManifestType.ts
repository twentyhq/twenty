import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type CommandMenuItemManifest = SyncableEntityOptions & {
  label: string;
  icon?: string;
  isPinned?: boolean;
  availabilityType?: 'GLOBAL' | 'SINGLE_RECORD' | 'BULK_RECORDS';
  availabilityObjectUniversalIdentifier?: string;
  frontComponentUniversalIdentifier: string;
};

export type FrontComponentCommandManifest = Omit<
  CommandMenuItemManifest,
  'frontComponentUniversalIdentifier'
>;

export type FrontComponentManifest = {
  universalIdentifier: string;
  name?: string;
  description?: string;
  sourceComponentPath: string;
  builtComponentPath: string;
  builtComponentChecksum: string;
  componentName: string;
  command?: FrontComponentCommandManifest;
};
