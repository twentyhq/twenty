import { type AppPlacementMetadata } from '@/application/appPlacementMetadataType';
import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';

export type CommandMenuItemManifest = SyncableEntityOptions & AppPlacementMetadata & {
  label: string;
  shortLabel?: string;
  /** @deprecated icon will be ignored in favor of application icon */
  icon?: string;
  isPinned?: boolean;
  availabilityType?:
    | 'GLOBAL'
    | 'GLOBAL_OBJECT_CONTEXT'
    | 'RECORD_SELECTION'
    | 'FALLBACK';
  availabilityObjectUniversalIdentifier?: string;
  frontComponentUniversalIdentifier: string;
  conditionalAvailabilityExpression?: string;
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
