import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type PageLayoutTabLayoutMode,
  type PageLayoutType,
  type PageLayoutWidgetPosition,
  type PageLayoutWidgetUniversalConfiguration,
  type PageLayoutWidgetVerticalListHeightBehavior,
  type UniversalConditionalDisplay,
  type WidgetType,
} from '@/types';

export type PageLayoutWidgetManifest = SyncableEntityOptions & {
  title: string;
  type: WidgetType;
  objectUniversalIdentifier?: string;
  conditionalDisplay?: UniversalConditionalDisplay;
  position?: PageLayoutWidgetPosition;
  heightBehavior?: PageLayoutWidgetVerticalListHeightBehavior;
  configuration: PageLayoutWidgetUniversalConfiguration;
};

export type StandalonePageLayoutWidgetManifest = PageLayoutWidgetManifest & {
  pageLayoutTabUniversalIdentifier: string;
  position: PageLayoutWidgetPosition;
};

export type PageLayoutTabManifest = SyncableEntityOptions & {
  title: string;
  position: number;
  icon?: string;
  layoutMode?: PageLayoutTabLayoutMode;
  conditionalDisplay?: UniversalConditionalDisplay;
  widgets?: PageLayoutWidgetManifest[];
  pageLayoutUniversalIdentifier?: string;
};

export type PageLayoutManifest = SyncableEntityOptions & {
  name: string;
  type: PageLayoutType;
  objectUniversalIdentifier?: string;
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier?: string;
  isFirstTabPinned?: boolean;
  tabs?: PageLayoutTabManifest[];
};
