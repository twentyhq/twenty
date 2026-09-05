import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type PageLayoutTabLayoutMode,
  type PageLayoutType,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetPosition,
  type PageLayoutWidgetUniversalConfiguration,
  type PageLayoutWidgetVerticalListHeightBehavior,
  type WidgetType,
} from '@/types';

export type PageLayoutWidgetManifest = SyncableEntityOptions & {
  title: string;
  type: `${WidgetType}`;
  objectUniversalIdentifier?: string;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay;
  // Legacy vertical-list positions stay accepted during manifest compatibility.
  position?: PageLayoutWidgetPosition;
  heightBehavior?: `${PageLayoutWidgetVerticalListHeightBehavior}`;
  configuration: PageLayoutWidgetUniversalConfiguration;
};

export type PageLayoutTabManifest = SyncableEntityOptions & {
  title: string;
  position: number;
  icon?: string;
  // Legacy CANVAS tabs stay accepted until existing apps have migrated.
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
