import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type GridPosition,
  type PageLayoutTabLayoutMode,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetUniversalConfiguration,
} from '@/types';

export type PageLayoutWidgetManifest = SyncableEntityOptions & {
  title: string;
  type: string;
  objectUniversalIdentifier?: string;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay;
  gridPosition?: GridPosition;
  configuration: PageLayoutWidgetUniversalConfiguration;
  // Required when the widget is defined standalone via definePageLayoutWidget;
  // populated automatically when nested inside definePageLayout/definePageLayoutTab.
  pageLayoutTabUniversalIdentifier?: string;
};

export type PageLayoutTabManifest = SyncableEntityOptions & {
  title: string;
  position: number;
  icon?: string;
  layoutMode?: PageLayoutTabLayoutMode;
  widgets?: PageLayoutWidgetManifest[];
  pageLayoutUniversalIdentifier?: string;
};

export type PageLayoutManifest = SyncableEntityOptions & {
  name: string;
  type?: string;
  objectUniversalIdentifier?: string;
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier?: string;
  tabs?: PageLayoutTabManifest[];
};
