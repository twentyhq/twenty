import {
  type WidgetType,
  type PageLayoutWidgetPosition,
} from 'twenty-shared/types';
import { type AllPageLayoutWidgetConfiguration } from 'src/engine/metadata-modules/page-layout-widget/types/all-page-layout-widget-configuration.type';

export type WidgetWithMetadataIds = {
  title: string;
  type: WidgetType;
  position: PageLayoutWidgetPosition;
  objectMetadataId?: string;
  configuration?: AllPageLayoutWidgetConfiguration;
};
