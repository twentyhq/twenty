import {
  type PageLayoutTabLayoutMode,
  type PageLayoutType,
  type PageLayoutWidgetConditionalDisplay,
  type PageLayoutWidgetPosition,
  type WidgetType,
} from 'twenty-shared/types';

import { type FieldDisplayMode } from 'src/engine/metadata-modules/page-layout-widget/enums/field-display-mode.enum';

export type StandardPageLayoutWidgetConfig = {
  universalIdentifier: string;
  title?: string;
  type?: WidgetType;
  position?: PageLayoutWidgetPosition;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay | null;
  conditionalAvailabilityExpression?: string | null;
  fieldUniversalIdentifier?: string;
  fieldDisplayMode?: FieldDisplayMode;
  embeddedViewUniversalIdentifier?: string;
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
  position?: PageLayoutWidgetPosition;
  conditionalDisplay?: PageLayoutWidgetConditionalDisplay | null;
  conditionalAvailabilityExpression?: string | null;
  fieldUniversalIdentifier?: string;
  fieldDisplayMode?: FieldDisplayMode;
  embeddedViewUniversalIdentifier?: string;
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
