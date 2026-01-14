import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export type IframeConfiguration = {
  configurationType?: WidgetConfigurationType;
  url?: string;
};
