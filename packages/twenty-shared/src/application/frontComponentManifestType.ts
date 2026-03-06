import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type CommandMenuItemManifest = SyncableEntityOptions & {
  label: string;
  icon?: string;
  isPinned?: boolean;
  availabilityType?: 'GLOBAL' | 'RECORD_SELECTION';
  availabilityObjectUniversalIdentifier?: string;
  frontComponentUniversalIdentifier: string;
  conditionalAvailabilityExpression?: string;
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
  isHeadless?: boolean;
  command?: FrontComponentCommandManifest;
};
