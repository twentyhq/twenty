import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import { type CommandMenuItemAvailabilityType } from '@/types';

export type CommandMenuItemManifest = SyncableEntityOptions & {
  label: string;
  shortLabel?: string;
  /** @deprecated icon will be ignored in favor of application icon */
  icon?: string;
  isPinned?: boolean;
  availabilityType?: CommandMenuItemAvailabilityType;
  availabilityObjectUniversalIdentifier?: string;
  frontComponentUniversalIdentifier: string;
  conditionalAvailabilityExpression?: string;
  conditionalPinnedExpression?: string;
};

// Where a front component can be placed: as a widget on record pages, as a
// widget on dashboards, or as the page behind a settings menu item.
export const FRONT_COMPONENT_SURFACES = [
  'OBJECTS',
  'DASHBOARDS',
  'SETTINGS',
] as const;

export type FrontComponentSurface = (typeof FRONT_COMPONENT_SURFACES)[number];

export const isFrontComponentSurface = (
  surface: string,
): surface is FrontComponentSurface =>
  (FRONT_COMPONENT_SURFACES as readonly string[]).includes(surface);

export const DEFAULT_FRONT_COMPONENT_AVAILABLE_ON: FrontComponentSurface[] = [
  'OBJECTS',
  'DASHBOARDS',
];

export const SETTINGS_FRONT_COMPONENT_AVAILABLE_ON: FrontComponentSurface[] = [
  'SETTINGS',
];

export type FrontComponentManifest = {
  universalIdentifier: string;
  name?: string;
  description?: string;
  sourceComponentPath: string;
  builtComponentPath: string;
  builtComponentChecksum: string;
  componentName: string;
  isHeadless?: boolean;
  availableOn?: FrontComponentSurface[];
  usesSdkClient?: boolean;
};
