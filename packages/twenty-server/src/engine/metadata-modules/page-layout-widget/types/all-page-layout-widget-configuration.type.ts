import { type ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE } from 'src/engine/metadata-modules/page-layout-widget/constants/all-widget-configuration-type-validator-by-widget-configuration-type.constant';

export type AllPageLayoutWidgetConfiguration = InstanceType<
  (typeof ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE)[keyof typeof ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE]
>;
