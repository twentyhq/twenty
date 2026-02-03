import {
  type PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';

export type StandardPageLayoutWidgetDefinition = {
  universalIdentifier: string;
  title?: string;
  type?: WidgetType;
  gridPosition?: GridPosition;
  position?: PageLayoutWidgetPosition;
};

export type StandardPageLayoutTabDefinition = {
  universalIdentifier: string;
  title: string;
  position: number;
  icon: string | null;
  layoutMode: PageLayoutTabLayoutMode;
  widgets: Record<string, StandardPageLayoutWidgetDefinition>;
};

export type StandardRecordPageWidgetDefinition = {
  universalIdentifier: string;
  title: string;
  type: WidgetType;
  gridPosition: GridPosition;
  position?: PageLayoutWidgetPosition;
};

export type StandardRecordPageTabDefinition = {
  universalIdentifier: string;
  title: string;
  position: number;
  icon: string | null;
  layoutMode: PageLayoutTabLayoutMode;
  widgets: Record<string, StandardRecordPageWidgetDefinition>;
};

export type StandardRecordPageLayoutDefinition = {
  universalIdentifier: string;
  objectUniversalIdentifier: string | null;
  defaultTabUniversalIdentifier: string | null;
  tabs: Record<string, StandardRecordPageTabDefinition>;
};

export type StandardRecordPageLayouts = Record<
  string,
  StandardRecordPageLayoutDefinition
>;
