import { type JsonbProperty } from 'twenty-shared/types';

import { type ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE } from 'src/engine/metadata-modules/page-layout-widget/constants/all-widget-configuration-type-validator-by-widget-configuration-type.constant';
import { type WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';

export type PageLayoutWidgetConfigurationTypeSettings<
  T extends WidgetConfigurationType,
> = InstanceType<
  JsonbProperty<
    (typeof ALL_WIDGET_CONFIGURATION_TYPE_VALIDATOR_BY_WIDGET_CONFIGURATION_TYPE)[T]
  >
>;
