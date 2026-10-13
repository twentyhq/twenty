import { type FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES } from '@/application/constants/FrontComponentWidgetPageLayoutTypes';
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

export type FrontComponentWidgetPageLayoutType =
  (typeof FRONT_COMPONENT_WIDGET_PAGE_LAYOUT_TYPES)[number];

export type FrontComponentWidgetAvailabilityManifest = {
  pageLayoutType: FrontComponentWidgetPageLayoutType;
  objectUniversalIdentifiers?: string[];
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
  widgetAvailability?: FrontComponentWidgetAvailabilityManifest[];
  usesSdkClient?: boolean;
};
