import { type SyncableEntityOptions } from '@/application/syncableEntityOptionsType';
import {
  type PageLayoutTabLayoutMode,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetPosition,
} from '@/types';

export type PageLayoutWidgetManifest = SyncableEntityOptions & {
  title: string;
  type: string;
  objectUniversalIdentifier?: string;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay;
  gridPosition?: {
    row: number;
    column: number;
    rowSpan: number;
    columnSpan: number;
  };
  position?: PageLayoutWidgetPosition;
  configuration: Record<string, unknown>;
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
