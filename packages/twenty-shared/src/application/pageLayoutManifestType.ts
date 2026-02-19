import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type PageLayoutTabLayoutMode,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetUniversalConfiguration
} from '@/types';

export type PageLayoutWidgetManifest = SyncableEntityOptions & {
  title: string;
  type: string;
  objectUniversalIdentifier?: string;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay;
  configuration: PageLayoutWidgetUniversalConfiguration;
};

export type PageLayoutTabManifest = SyncableEntityOptions & {
  title: string;
  position: number;
  icon?: string;
  layoutMode?: PageLayoutTabLayoutMode;
  widgets?: PageLayoutWidgetManifest[];
};

export type PageLayoutManifest = SyncableEntityOptions & {
  name: string;
  type?: string;
  objectUniversalIdentifier?: string;
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier?: string;
  tabs?: PageLayoutTabManifest[];
};
