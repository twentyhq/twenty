import {
  type PageLayoutTabLayoutMode,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';

import { type WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { type GridPosition } from 'src/engine/metadata-modules/page-layout-widget/types/grid-position.type';
import { type PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

export type StandardPageLayoutWidgetConfig = {
  universalIdentifier: string;
  title?: string;
  type?: WidgetType;
  gridPosition?: GridPosition;
  position?: PageLayoutWidgetPosition;
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
  layoutName: string;
  name: string;
  type: PageLayoutType;
  objectUniversalIdentifier: string | null;
  universalIdentifier: string;
  defaultTabUniversalIdentifier: string | null;
  tabs: Record<string, StandardPageLayoutTabConfig>;
};
