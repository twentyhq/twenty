import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type CommandMenuItemAvailabilityType } from '@/types';

export type CommandMenuItemManifest = SyncableEntityOptions & {
  label: string;
  shortLabel?: string;
  /** @deprecated icon will be ignored in favor of application icon */
  icon?: string;
  isPinned?: boolean;
  availabilityType?: `${CommandMenuItemAvailabilityType}`;
  availabilityObjectUniversalIdentifier?: string;
  frontComponentUniversalIdentifier: string;
  conditionalAvailabilityExpression?: string;
  conditionalPinnedExpression?: string;
};

export type FrontComponentManifest = {
  universalIdentifier: string;
  name?: string;
  description?: string;
  sourceComponentPath: string;
  builtComponentPath: string;
  builtComponentChecksum: string;
  componentName: string;
  isHeadless?: boolean;
  usesSdkClient?: boolean;
};
