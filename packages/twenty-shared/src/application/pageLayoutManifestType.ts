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
};

export type PageLayoutTabManifest = SyncableEntityOptions & {
  title: string;
  position: number;
  icon?: string;
  layoutMode?: PageLayoutTabLayoutMode;
  widgets?: PageLayoutWidgetManifest[];
  // Optional: only required when defining a tab standalone (via
  // `definePageLayoutTab`) on an existing page layout. When the tab is
  // declared inline as part of `definePageLayout({ tabs: [...] })`, the
  // parent page layout's `universalIdentifier` is used automatically.
  pageLayoutUniversalIdentifier?: string;
};

export type PageLayoutManifest = SyncableEntityOptions & {
  name: string;
  type?: string;
  objectUniversalIdentifier?: string;
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier?: string;
  tabs?: PageLayoutTabManifest[];
};
