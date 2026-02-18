import {
  type PageLayoutTabLayoutMode,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetPosition,
  type GridPosition,
} from 'twenty-shared/types';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export type StandardPageLayoutWidgetConfig = {
  universalIdentifier: string;
  title?: string;
  type?: WidgetType;
  gridPosition?: GridPosition;
  position?: PageLayoutWidgetPosition;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay | null;
};

export type StandardPageLayoutTabConfig = {
  universalIdentifier: string;
  title: string;
  position: number;
  icon: string | null;
  layoutMode: PageLayoutTabLayoutMode;
  widgets: Record<string, StandardPageLayoutWidgetConfig>;
};

export type StandardPageLayoutConfig = {
  name: string;
  type: PageLayoutType;
  objectUniversalIdentifier: string | null;
  universalIdentifier: string;
  defaultTabUniversalIdentifier: string | null;
  tabs: Record<string, StandardPageLayoutTabConfig>;
};

export type StandardRecordPageWidgetConfig = {
  universalIdentifier: string;
  title: string;
  type: WidgetType;
  gridPosition: GridPosition;
  position?: PageLayoutWidgetPosition;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay | null;
};

export type StandardRecordPageTabConfig = {
  universalIdentifier: string;
  title: string;
  position: number;
  icon: string | null;
  layoutMode: PageLayoutTabLayoutMode;
  widgets: Record<string, StandardRecordPageWidgetConfig>;
};

export type StandardRecordPageLayoutConfig = {
  universalIdentifier: string;
  objectUniversalIdentifier: string | null;
  defaultTabUniversalIdentifier: string | null;
  tabs: Record<string, StandardRecordPageTabConfig>;
};

export type StandardRecordPageLayouts = Record<
  string,
  StandardRecordPageLayoutConfig
>;
