import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { PageLayoutWidgetConfigurationTypeSettings } from 'src/engine/metadata-modules/page-layout-widget/types/page-layout-widget-configuration.type';

export type AllPageLayoutWidgetConfiguration =
  PageLayoutWidgetConfigurationTypeSettings<WidgetConfigurationType>;
