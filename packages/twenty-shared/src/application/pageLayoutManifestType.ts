import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type GridPosition,
  type PageLayoutTabLayoutMode,
  type PageLayoutType,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetUniversalConfiguration,
  type WidgetType,
} from '@/types';

export type PageLayoutWidgetManifest = SyncableEntityOptions & {
  title: string;
  type: `${WidgetType}`;
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
  pageLayoutUniversalIdentifier?: string;
};

export type PageLayoutManifest = SyncableEntityOptions & {
  name: string;
  type: `${PageLayoutType}`;
  objectUniversalIdentifier?: string;
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier?: string;
  tabs?: PageLayoutTabManifest[];
};
